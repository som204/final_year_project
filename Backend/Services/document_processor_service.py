from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

def load_and_split_document(file_path: str):
    """Loads a document and splits it into chunks."""
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension == 'pdf':
        loader = PyPDFLoader(file_path)
    elif file_extension == 'docx':
        loader = Docx2txtLoader(file_path)
    elif file_extension == 'csv':
        loader = CSVLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = text_splitter.split_documents(documents)
    
    print(f"📄 Loaded and split '{file_path}' into {len(split_docs)} chunks.")
    return split_docs