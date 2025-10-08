
from langchain_unstructured import UnstructuredLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import dotenv
dotenv.load_dotenv()


def load_and_split_document(file_path: str):
    """
    Loads any supported document type, sanitizes its metadata,
    and splits it into chunks.
    """
    with open(file_path, "rb") as file_obj:
        loader = UnstructuredLoader(
            file=file_obj,
            api_key=os.getenv("UNSTRUCTURED_API_KEY"),
            partition_via_api=True,
        )
        documents = loader.load()
    
   
    for doc in documents:
       
        if hasattr(doc, "metadata") and isinstance(doc.metadata, dict):
            sanitized_metadata = {}
            for key, value in doc.metadata.items():
               
                if isinstance(value, list):
                   
                    sanitized_metadata[key] = ", ".join(map(str, value))
                else:
                    
                    sanitized_metadata[key] = value
            
            doc.metadata = sanitized_metadata
    
    # The rest of the logic remains the same
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = text_splitter.split_documents(documents)
    
    print(f"📄 Loaded and split '{file_path}' into {len(split_docs)} chunks.")
    return split_docs