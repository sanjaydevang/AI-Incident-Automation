AI Incident Analyst
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
This project provides a strong foundation. The following features represent a high-level roadmap for future enhancements:

Generative Runbook Suggestions: Enhance the AI to generate a step-by-step mitigation checklist tailored to the current incident, based on what it learned from similar past events.

Automated Timeline Generation: Allow the AI to parse timestamps from uploaded log files to automatically create a human-readable timeline of key events.

Live Monitoring Integration: Build connectors to platforms like Datadog or Prometheus to enrich the AI's analysis with real-time alerts and metrics.

User Feedback Loop: Implement a "thumbs up/down" system for the AI's analysis to collect data for fine-tuning the model over time.

Git-Powered Knowledge Base: Modify the data connector to pull incident documents from a dedicated Git repository instead of a local folder, enabling better version control and collaboration.
