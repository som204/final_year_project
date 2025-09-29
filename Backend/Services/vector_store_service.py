import chromadb
import hashlib
import os
import sys

# --- REFINEMENT: All imports are now at the top level ---
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Correctly add the project root to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

# REFINEMENT: Removed unused GOOGLE_API_KEY and EMBEDDING_MODEL_NAME
from config import VECTOR_STORE_PATH, CHROMA_COLLECTION_NAME

class VectorStoreManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=VECTOR_STORE_PATH)
        self.collection = self.client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)

    @staticmethod
    def get_file_hash(file_path):
        """Calculates the SHA256 hash of a file to uniquely identify it."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def check_document_exists(self, file_hash: str) -> bool:
        """Checks if a document with the given hash already exists in the vector store."""
        results = self.collection.get(where={"file_hash": file_hash})
        return len(results['ids']) > 0

    def add_documents(self, documents, file_hash: str):
        """Adds LangChain document objects to the collection."""
        if not documents:
            return
            
        for doc in documents:
            doc.metadata["file_hash"] = file_hash

        self.collection.add(
            documents=[doc.page_content for doc in documents],
            metadatas=[doc.metadata for doc in documents],
            ids=[f"{file_hash}_{i}" for i in range(len(documents))]
        )
        print(f"✅ Successfully added {len(documents)} document chunks for file hash: {file_hash}")

    def get_retriever(self):
        """Returns a LangChain retriever for the collection."""
        
        # Initialize the embedding model
        model_name = "sentence-transformers/all-MiniLM-L6-v2" 
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': True}
        embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        
        # Create the LangChain vector store instance
        vector_store = Chroma(
            client=self.client,
            collection_name=CHROMA_COLLECTION_NAME,
            embedding_function=embeddings,
        )
        return vector_store.as_retriever()