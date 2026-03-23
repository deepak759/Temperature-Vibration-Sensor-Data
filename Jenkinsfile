pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'deepaksharma611'
        IMAGE_NAME = "${DOCKERHUB_USER}/my-react-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = '/var/jenkins_home/kubeconfig.yaml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        

        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl apply -f k8s-deployment.yaml"
                sh "kubectl set image deployment/my-react-app my-react-app=${IMAGE_NAME}:${IMAGE_TAG}"
                sh "kubectl rollout status deployment/my-react-app --timeout=120s"
            }
        }
    }

    post {
        success {
            echo "✅ Deployed ${IMAGE_NAME}:${IMAGE_TAG} successfully!"
        }
        failure {
            echo "❌ Pipeline failed — check stage logs above"
        }
    }
}










