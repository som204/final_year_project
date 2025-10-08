import chromadb
import hashlib
import os
import sys

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
# --- THIS IS THE FIX ---
# The import path for the retriever has been updated to the correct location
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

from config import VECTOR_STORES_BASE_DIR, COHERE_API_KEY

class VectorStoreManager:
    """
    Manages multiple, per-institute ChromaDB vector stores with efficient, cached clients.
    """
    def __init__(self):
        # Initialize the embedding model once to be reused.
        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': True}
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        self.clients = {}

    def _get_institute_path(self, institute_id: int) -> str:
        path = os.path.join(VECTOR_STORES_BASE_DIR, f"institute_{institute_id}")
        os.makedirs(path, exist_ok=True)
        return path

    def _get_project_collection_name(self, project_id: int) -> str:
        return f"project_{project_id}"

    def _get_client(self, institute_id: int):
        if institute_id not in self.clients:
            print(f"-> Initializing new ChromaDB client for institute '{institute_id}'...")
            institute_path = self._get_institute_path(institute_id)
            self.clients[institute_id] = chromadb.PersistentClient(path=institute_path)
        return self.clients[institute_id]

    @staticmethod
    def get_file_hash(file_path: str) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def check_document_exists(self, file_hash: str, institute_id: int, project_id: int) -> bool:
        client = self._get_client(institute_id)
        collection_name = self._get_project_collection_name(project_id)
        try:
            collections = [c.name for c in client.list_collections()]
            if collection_name not in collections:
                return False
            collection = client.get_collection(name=collection_name)
            results = collection.get(where={"file_hash": file_hash})
            return len(results['ids']) > 0
        except Exception:
            return False

    def add_documents(self, documents, file_hash: str, institute_id: int, project_id: int):
        client = self._get_client(institute_id)
        collection_name = self._get_project_collection_name(project_id)
        for doc in documents:
            doc.metadata["file_hash"] = file_hash
        Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            client=client,
            collection_name=collection_name
        )
        print(f"✅ Added {len(documents)} chunks to collection '{collection_name}' for institute '{institute_id}'")

    def get_retriever(self, institute_id: int, project_id: int):
        """
        Returns a highly efficient Contextual Compression Retriever that uses a reranker.
        """
        client = self._get_client(institute_id)
        collection_name = self._get_project_collection_name(project_id)
        
        # 1. Create the base retriever
        base_vector_store = Chroma(
            client=client,
            collection_name=collection_name,
            embedding_function=self.embeddings,
        )
        base_retriever = base_vector_store.as_retriever(search_kwargs={"k": 10})

        # 2. Create the reranker compressor
        compressor = CohereRerank(
            cohere_api_key=COHERE_API_KEY,
            model="rerank-english-v3.0",
            top_n=3
        )

        # 3. Create the final Contextual Compression Retriever
        compression_retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )
        
        print("-> Efficient Contextual Compression Retriever initialized.")
        return compression_retriever