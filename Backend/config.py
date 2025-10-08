import os
from dotenv import load_dotenv
from pydantic import SecretStr

load_dotenv()

# --- API Keys ---
api=os.getenv("GOOGLE_API_KEY")
GOOGLE_API_KEY = SecretStr(api) if api else None

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_API_KEY = SecretStr(COHERE_API_KEY) if COHERE_API_KEY else None

# --- File Paths ---
VECTOR_STORES_BASE_DIR = "./Vector_stores"
UPLOADS_DIR = "./uploads"
TEMPLATE_DIR = "./Templates"

# --- LLM and Embedding Models ---
LLM_MODEL_NAME = "gemini-2.5-pro"
EMBEDDING_MODEL_NAME = "models/embedding-001"

# --- Vector Store Configuration ---
CHROMA_COLLECTION_NAME = "institute_reports"