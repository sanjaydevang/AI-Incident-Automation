pipeline {
    agent any // This pipeline can run on any available Jenkins agent.

    environment {
        // Define environment variables used in the pipeline.
        // It's good practice to manage registry credentials securely in Jenkins.
        DOCKER_REGISTRY_URL = 'your-docker-registry-url' // e.g., 'docker.io/yourusername'
        DOCKER_CREDENTIALS_ID = 'your-docker-credentials-id'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Get the latest code from your Git repository.
                git 'https://github.com/sanjaydevang/AI-Incident-Automation.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    // Build the backend Docker image and tag it with the build number.
                    sh 'docker build -t ${DOCKER_REGISTRY_URL}/ai-analyst-backend:${BUILD_NUMBER} ./backend'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    // Build the frontend Docker image and tag it.
                    sh 'docker build -t ${DOCKER_REGISTRY_URL}/ai-analyst-frontend:${BUILD_NUMBER} ./frontend'
                }
            }
        }
        
        // You can add a 'Test' stage here to run automated tests in the future.

        stage('Push to Registry') {
            steps {
                // Log in to your Docker registry and push the images.
                withDockerRegistry(credentialsId: DOCKER_CREDENTIALS_ID, url: "https://${DOCKER_REGISTRY_URL}") {
                    sh 'docker push ${DOCKER_REGISTRY_URL}/ai-analyst-backend:${BUILD_NUMBER}'
                    sh 'docker push ${DOCKER_REGISTRY_URL}/ai-analyst-frontend:${BUILD_NUMBER}'
                }
            }
        }

        stage('Deploy') {
            steps {
                // This is a simplified deployment step for learning.
                // It would SSH into a server and run docker-compose to update the application.
                echo 'Deploying to production server...'
                // Example command you might run on a server:
                // ssh user@your-server "cd /path/to/app && docker-compose pull && docker-compose up -d"
            }
        }
    }

    post {
        always {
            // Clean up the workspace after the pipeline runs.
            cleanWs()
        }
    }
}
