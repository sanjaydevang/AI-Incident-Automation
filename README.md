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


Future Roadmap

AI Incident Analyst: Feature Enhancement Roadmap
This document outlines a roadmap for enhancing the AI Incident Analyst, evolving it from a powerful advisory tool into an integrated and indispensable part of the incident response workflow.

Tier 1: Core AI & Workflow Improvements
These features build directly on the existing application to make the core analysis more powerful and useful.

1. Generative Runbook Suggestions
What it is: Instead of just linking to a similar past incident, the AI will generate a brand-new, step-by-step checklist of mitigation actions tailored to the current incident.

How to build it:

First, perform the existing search to find the most relevant historical document.

Send the content of that historical document and the new incident description to the Gemini API.

Use a prompt like: "Based on the successful resolution of the past incident provided, generate a concise, markdown-formatted checklist of immediate actions to take for the new incident."

Display this generated checklist in the UI.

2. Automated Timeline Generation
What it is: When a user uploads a log file, the AI will parse the timestamps and error messages to automatically create a human-readable timeline of key events.

How to build it:

Update the /analyze-incident-details/ endpoint to handle file content.

Send the log file content to Gemini with a prompt like: "Analyze the following log file. Identify the 5-10 most critical events (errors, warnings, service starts/stops) and return them as a JSON array, with each object containing a 'timestamp' and a 'description'."

Render this timeline in the frontend UI.

3. User Feedback Loop for Fine-Tuning
What it is: Add "thumbs up" / "thumbs down" icons to the AI Analysis results. This feedback is collected and used to make the model smarter over time.

How to build it:

Add the icons to the React UI.

Create a new /feedback endpoint on the backend that accepts the user's rating, the original query, and the AI's response.

Log this data to a CSV file or a database. This dataset becomes invaluable for future fine-tuning of the Gemini model.

Tier 2: Integrations with External Systems
These features connect the AI Analyst to the outside world, making it aware of real-time events.

1. Live Monitoring Integration (e.g., Datadog, Prometheus)
What it is: Connect the application to your monitoring tools to automatically pull in relevant alerts and metrics when an incident is being analyzed.

How to build it:

Create a new "connector" module in the backend (e.g., datadog_connector.py).

Use the Datadog API to fetch alerts from the last 15 minutes that match the services mentioned in the incident description.

Dynamically add this real-time data to the context of the prompt sent to Gemini, resulting in a much more accurate analysis.

2. Communication Integration (e.g., Slack, Microsoft Teams)
What it is: Automatically post a summary of the AI's initial analysis to a designated incident response channel.

How to build it:

Create a slack_service.py module in the backend.

When the analysis is complete, use a Slack Incoming Webhook URL (stored securely in the .env file) to send a formatted message.

The message should include the incident summary, probable cause, and a link back to the AI Analyst web UI.

3. Version Control Integration (e.g., Git)
What it is: Instead of a local folder, the knowledge base is a Git repository containing Markdown files. This makes collaboration and versioning much easier.

How to build it:

Modify the local_connector.py (or create a new git_connector.py).

When "Sync Data" is clicked, the backend will first perform a git pull on a configured repository to get the latest documents before indexing them.

Tier 3: Operational Excellence
These features focus on making the application robust, scalable, and easy to deploy.

1. Dockerization
What it is: Package the frontend and backend into separate Docker containers.

How to build it:

Create a Dockerfile for the Python/FastAPI backend.

Create a multi-stage Dockerfile for the React frontend to build the static assets and serve them with a lightweight web server like Nginx.

Create a docker-compose.yml file to define and run both services with a single command (docker-compose up).

2. User Authentication
What it is: Add a login system to secure the application.

How to build it:

Use a simple authentication library for FastAPI, like fastapi-login, to manage user sessions with secure cookies.

Protect the analysis endpoints so they can only be accessed by logged-in users.

Add login/logout forms to the React UI.
