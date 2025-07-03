from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

# Import our services and the NEW local connector
from local_connector import LocalConnector
from vector_store import vector_store

app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "AI Incident Analyst Backend is running."}

@app.get("/sync-local-data/")
def sync_local_data():
    """
    Triggers a sync with the local data folder. Fetches documents, 
    generates embeddings, and adds them to the vector store.
    """
    print("Received request to sync with local data folder...")
    connector = LocalConnector()
    
    try:
        pages = connector.fetch_documents()
        
        if not pages:
            return {"message": "Sync complete. No local documents found to add to the vector store.", "pages_added": 0}
        
        # Rebuild the vector store with the fetched pages
        vector_store.build_index_from_documents(pages)
        
        return {
            "message": f"Sync successful. Rebuilt index with {len(pages)} pages.",
            "pages_added": len(pages),
            "total_pages_in_store": vector_store.index.ntotal if vector_store.index else 0
        }
    except Exception as e:
        print(f"Error during local data sync: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during sync: {e}")

@app.post("/search-incidents/")
def search_incidents(query: str = Body(..., embed=True)):
    """
    Searches for incidents in the vector store similar to the given query.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    print(f"Received search query: '{query}'")
    try:
        results = vector_store.search(query_text=query, k=3)
        return {
            "query": query,
            "results": results
        }
    except Exception as e:
        print(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during search: {e}")

# This endpoint remains the same for now
@app.post("/analyze-incident/")
async def analyze_incident(log_file: UploadFile = File(...)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, log_file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(log_file.file, buffer)
        
        return {
            "filename": log_file.filename,
            "detail": "File uploaded. In the next phase, this will trigger a search for similar incidents."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        log_file.file.close()
