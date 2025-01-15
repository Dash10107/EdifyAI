import faiss
import torch
import os
from langchain.chains import ConversationalRetrievalChain
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain_community.document_loaders import TextLoader
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from dotenv import load_dotenv
import json
import numpy as np
from langchain.docstore.document import Document  # Import Document class

load_dotenv()

def create_conversational_chain(vector_store):
    # Using Groq to call Meta Llama
    llm = ChatGroq(
        model_name="Llama3-8b-8192",
        groq_api_key=os.getenv("GROQ_API"),
        streaming=True,
        callbacks=[StreamingStdOutCallbackHandler()],
        temperature=0.01,
        top_p=1,
        max_tokens=100,
    )
    
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        chain_type='stuff',
        retriever=vector_store.as_retriever(search_kwargs={"k": 2}),
        memory=memory,
    )
    return chain


def answer_query(description:str, query: str):
    print(query)
    # Create Document object from the description string
    documents = [Document(page_content=description)]  # Wrap the description as a Document

    # Use the RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    text_chunks = text_splitter.split_documents(documents)  # This now works because of Document class

    # Create embeddings using Hugging Face
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2", 
        model_kwargs={'device': 'cpu'}
    )

    # Create vector store
    vector_store = FAISS.from_documents(text_chunks, embedding=embeddings)

    # Create the chain object
    chain = create_conversational_chain(vector_store)
    result = chain.invoke({"question": query})
    return result

