import chromadb
import hashlib
import os
import sys
import torch

# Optimize CPU usage
torch.set_num_threads(4)  # adjust based on your CPU

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from langchain_chroma import Chroma
from sentence_transformers import SentenceTransformer
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

from config import VECTOR_STORES_BASE_DIR, COHERE_API_KEY
#testing
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models", "all-MiniLM-L6-v2")

# 🚀 FAST EMBEDDING CLASS (NO HF WRAPPER)
class FastEmbedding:
    def __init__(self):
        self.model = SentenceTransformer(
            os.path.abspath(MODEL_DIR),  # auto-download + cache
            device="cpu"         # change to "cuda" if GPU available
        )

    def embed_documents(self, texts):
        return self.model.encode(
            texts,
            batch_size=32,               # 🔥 speed boost
            show_progress_bar=False,
            normalize_embeddings=True
        ).tolist()

    def embed_query(self, text):
        return self.model.encode(
            text,
            normalize_embeddings=True
        ).tolist()


class VectorStoreManager:
    """
    Manages multiple, per-institute ChromaDB vector stores with efficient, cached clients.
    """

    def __init__(self):
        # ✅ Use fast embedding instead of HuggingFaceEmbeddings
        self.embeddings = FastEmbedding()
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

        # 🔍 Base retriever
        base_vector_store = Chroma(
            client=client,
            collection_name=collection_name,
            embedding_function=self.embeddings,
        )

        base_retriever = base_vector_store.as_retriever(search_kwargs={"k": 10})

        # 🧠 Reranker
        compressor = CohereRerank(
            cohere_api_key=COHERE_API_KEY,
            model="rerank-english-v3.0",
            top_n=3
        )

        # ⚡ Final retriever
        compression_retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )

        print("-> Efficient Contextual Compression Retriever initialized.")
        return compression_retriever