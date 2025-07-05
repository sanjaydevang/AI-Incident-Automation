#AI Incident Analyst

The AI Incident Analyst is a full-stack application designed to help engineering teams diagnose and resolve production incidents faster. It leverages a local knowledge base of past incident reports and the power of Large Language Models (LLMs) to provide intelligent analysis, identify similar historical incidents, and suggest a probable cause.

This project is fully containerized with Docker and includes an automated CI/CD pipeline using GitHub Actions to build and push images to Docker Hub.

Core Features
AI-Powered Analysis: Utilizes the Google Gemini API to analyze new incident descriptions, providing a concise Summary, a Probable Cause, and a likely Error Category (e.g., Database, Network, Application).

Similarity Search: When a new incident occurs, the tool performs a semantic search against a knowledge base of past incidents and runbooks to find the most relevant historical context.

Local Knowledge Base: Builds its memory from a simple folder of local text or Markdown files (.txt, .md), making it easy to get started without complex integrations.

Log File Upload: Supports direct upload of log files, which will be used as the primary source for the analysis.

Dockerized Environment: The entire application (frontend and backend) is containerized, allowing for consistent, one-command local setup.

Automated CI/CD: A GitHub Actions pipeline automatically builds and pushes new Docker images to Docker Hub whenever changes are merged into the main branch.

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

DevOps:

Containerization: Docker, Docker Compose

CI/CD: GitHub Actions

Getting Started
Follow these instructions to get the project running on your local machine using Docker.

Prerequisites
Docker and Docker Compose

A Google Gemini API Key. You can get a free key from Google AI Studio.

Running the Application Locally
Clone the repository:

git clone https://github.com/sanjaydevang/AI-Incident-Automation.git
cd AI-Incident-Automation

Create the environment file:
In the root directory of the project, create a new file named .env. Add your Gemini API key to this file. This is required by docker-compose.

GEMINI_API_KEY="YOUR_API_KEY_HERE"

Populate the Knowledge Base:
Add your incident reports, postmortems, or runbooks as .txt or .md files into the backend/local_data folder. Sample files are already included.

Build and Run with Docker Compose:
From the root directory of the project, run this single command:

docker-compose up --build -d

--build: This flag tells Docker Compose to build the images from your Dockerfiles the first time you run it.

-d: This flag runs the containers in "detached" mode (in the background).

Access the Application:
The application will be available at http://localhost:3000.

Sync Data:
On the web page, click the "Sync Data" button to load the documents from your local_data folder into the AI's memory.

To stop the application, run docker-compose down from the root directory.

CI/CD Pipeline with GitHub Actions
This project includes a fully automated CI/CD pipeline defined in the .github/workflows/ci-cd.yml file.

How it Works
Trigger: The pipeline automatically runs every time a change is pushed or merged into the main branch.

Build: It builds new Docker images for both the frontend and backend services.

Push: It securely logs in to Docker Hub and pushes the new images to your repositories (sanjaydevang/ai-analyst-backend and sanjaydevang/ai-analyst-frontend).

Setup for Your Fork
If you have forked this repository and want the pipeline to work with your own Docker Hub account, you must do the following:

Create a Docker Hub Access Token: Go to your Docker Hub account settings, navigate to "Security," and create a new Personal Access Token with "Read, Write, Delete" permissions.

Add GitHub Secrets: In your forked GitHub repository, go to Settings > Secrets and variables > Actions and add the following two repository secrets:

DOCKERHUB_USERNAME: Your Docker Hub username.

DOCKERHUB_TOKEN: The access token you just created.

Update the Workflow File: In the .github/workflows/ci-cd.yml file, replace sanjaydevang with your own Docker Hub username in the tags sections.


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
