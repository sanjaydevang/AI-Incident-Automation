# AI-Incident-Automation

The AI Incident Analyst is a full-stack application designed to help engineering teams diagnose and resolve production incidents faster. It leverages a local knowledge base of past incident reports and the power of Large Language Models (LLMs) to provide intelligent analysis, identify similar historical incidents, and suggest a probable cause.

Core Features
AI-Powered Analysis: Utilizes the Google Gemini API to analyze new incident descriptions, providing a concise Summary, a Probable Cause, and a likely Error Category (e.g., Database, Network, Application).

Similarity Search: When a new incident occurs, the tool performs a semantic search against a knowledge base of past incidents and runbooks to find the most relevant historical context.

Local Knowledge Base: Builds its memory from a simple folder of local text or Markdown files (.txt, .md), making it easy to get started without complex integrations.

Log File Upload: Supports direct upload of log files, which will be used as the primary source for the analysis.

Web-Based UI: A clean, intuitive React interface for reporting new incidents, syncing data, and viewing analysis results.

Tech Stack
Backend:

Framework: Python, FastAPI

AI/ML:

Google Gemini API for generative analysis.

sentence-transformers for creating text embeddings.

faiss (from Meta AI) for efficient vector similarity search.

Server: Uvicorn

Frontend:

Framework: React

Styling: Tailwind CSS

Icons: Lucide React

Getting Started
Follow these instructions to get the project running on your local machine.

Prerequisites
Node.js and npm

Python 3.8+ and pip

A Google Gemini API Key. You can get a free key from Google AI Studio.

Backend Setup
Navigate to the backend directory:

cd backend

Create an environment file:
Create a new file named .env in the backend directory. Add your Gemini API key to this file:

GEMINI_API_KEY="YOUR_API_KEY_HERE"

Install Python dependencies:

pip install -r requirements.txt

Run the backend server:

uvicorn main:app --reload

The backend server will be running at http://localhost:8000.

Frontend Setup
Navigate to the frontend directory:
Open a new terminal window and navigate to the frontend folder.

cd frontend

Install Node dependencies:

npm install

Run the frontend server:

npm start

The application will open in your browser at http://localhost:3000.

How to Use
Populate the Knowledge Base: Before you can analyze incidents, you must "teach" the AI.

Add your own incident reports, postmortems, or runbooks as .txt or .md files into the backend/local_data folder.

On the web page, click the "Sync Data" button. This reads your files, creates embeddings, and builds the search index.

Analyze a New Incident:

Fill in the "Incident Title" and "Description" fields with details about a new incident.

Alternatively, upload a log file using the drag-and-drop component. The analysis will prioritize the content of the uploaded file.

Click the "Analyze Incident" button.

Review the Results:

The "Analysis Results" section on the right will update.

AI Analysis: At the top, you will see the Gemini model's assessment, including the probable error category, a summary, and a likely cause.

Similar Historical Incidents: Below the AI analysis, you will see a ranked list of the most relevant documents from your knowledge base.

Future Roadmap
This project provides a strong foundation. The following steps, as outlined in the project's roadmap, can be taken to evolve it into a production-grade tool:

Automated Data Ingestion: Implement a scheduler or webhooks to automatically sync new documents from sources like Git or Confluence, eliminating the manual "Sync Data" step.

Live System Integration: Build connectors to observability platforms (Datadog, Prometheus) and CI/CD systems to enrich the AI's analysis with real-time context.

Enforce Data Quality: Use AI-powered validation to ensure that all documents added to the knowledge base meet a minimum quality standard and contain required sections.

Implement a Feedback Loop: Add a "thumbs up/down" feature to the UI, allowing users to rate the quality of the AI's analysis. This feedback can be logged and used to fine-tune the model over time.
