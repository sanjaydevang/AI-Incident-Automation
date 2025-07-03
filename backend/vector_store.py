import faiss
import numpy as np
import json
import os

from llm_service import llm_service

class VectorStore:
    def __init__(self, index_path="vector_store.faiss", metadata_path="metadata.json"):
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.index = None
        self.metadata = []
        self.load()

    def build_index_from_documents(self, documents: list[dict]):
        if not documents:
            print("No documents provided to build index.")
            return

        self.index = None
        self.metadata = []
        print("Cleared existing vector store data before building new index.")

        texts = [doc['cleaned_text'] for doc in documents]
        if not texts:
            print("Documents have no text to process.")
            return
            
        embeddings = llm_service.get_embeddings(texts)
        if not embeddings:
            print("Failed to generate embeddings. Cannot build index.")
            return
            
        # --- DEBUGGING STEP ---
        print("\n--- DEBUG: EMBEDDINGS ---")
        for i, doc in enumerate(documents):
            print(f"Document: {doc['title']}")
            # ADDED THIS LINE to see the text content
            print(f"  Text preview: '{doc['cleaned_text'][:70]}...'")
            # Print the first 5 values of the embedding vector
            print(f"  Embedding preview: {embeddings[i][:5]}")
        print("-------------------------\n")
        # --- END DEBUGGING STEP ---

        embeddings_np = np.array(embeddings, dtype='float32')
        
        faiss.normalize_L2(embeddings_np)
        
        dimension = embeddings_np.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        print(f"Created a new FAISS index with dimension {dimension} using Inner Product.")

        self.index.add(embeddings_np)
        
        for doc in documents:
            doc_metadata = {
                'id': doc.get('id'),
                'title': doc.get('title'),
                'url': doc.get('url'),
                'last_modified': doc.get('last_modified'),
            }
            self.metadata.append(doc_metadata)
            
        print(f"Built index with {len(documents)} documents.")
        self.save()

    def search(self, query_text: str, k: int = 5) -> list[dict]:
        if self.index is None or self.index.ntotal == 0:
            print("Vector store is empty. Cannot perform search.")
            return []
            
        query_embedding = llm_service.get_embeddings([query_text])
        if not query_embedding:
            print("Failed to generate query embedding.")
            return []

        query_embedding_np = np.array(query_embedding, dtype='float32')
        faiss.normalize_L2(query_embedding_np)
        
        num_items_in_index = self.index.ntotal
        if k > num_items_in_index:
            k = num_items_in_index

        distances, indices = self.index.search(query_embedding_np, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1:
                results.append({
                    "document": self.metadata[idx],
                    "similarity_score": float(distances[0][i]) 
                })
        
        print(f"Search found {len(results)} results.")
        return results

    def save(self):
        print(f"Saving FAISS index to {self.index_path}")
        faiss.write_index(self.index, self.index_path)
        
        print(f"Saving metadata to {self.metadata_path}")
        with open(self.metadata_path, 'w') as f:
            json.dump(self.metadata, f)
        print("Vector store saved successfully.")

    def load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                print(f"Loading FAISS index from {self.index_path}")
                self.index = faiss.read_index(self.index_path)
                
                print(f"Loading metadata from {self.metadata_path}")
                with open(self.metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                
                print(f"Vector store loaded. Index contains {self.index.ntotal} vectors.")
            except Exception as e:
                print(f"Error loading vector store: {e}. Starting fresh.")
                self.index = None
                self.metadata = []
        else:
            print("No existing vector store found. A new one will be created.")

vector_store = VectorStore()