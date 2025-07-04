from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from local_connector import LocalConnector
from vector_store import vector_store
from generative_service import generative_service

app = FastAPI()

origins = ["http://localhost:3000", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Incident Analyst Backend is running."}

@app.get("/sync-local-data/")
def sync_local_data():
    print("Received request to sync with local data folder...")
    connector = LocalConnector()
    try:
        pages = connector.fetch_documents()
        if not pages:
            return {"message": "Sync complete. No local documents found.", "pages_added": 0}
        vector_store.build_index_from_documents(pages)
        return {
            "message": f"Sync successful. Rebuilt index with {len(pages)} pages.",
            "pages_added": len(pages),
            "total_pages_in_store": vector_store.index.ntotal if vector_store.index else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search-incidents/")
def search_incidents(query: str = Body(..., embed=True)):
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        results = vector_store.search(query_text=query, k=3)
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT RENAMED AND UPGRADED ---
@app.post("/analyze-incident-details/")
async def analyze_incident_details(query: str = Body(..., embed=True)):
    """
    Analyzes the incident text to get a category, summary, and probable cause.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query for analysis cannot be empty.")
    try:
        analysis = await generative_service.analyze_incident(query)
        return {"query": query, "analysis": analysis}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
