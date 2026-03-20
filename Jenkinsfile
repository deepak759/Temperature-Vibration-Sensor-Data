pipeline {
  agent any
  stages {
    stage('Build Docker Image') {
      steps {
        bat 'docker build -t my-react-app:latest .'
      }
    }
    stage('Load Image into Minikube') {
      steps {
        // Makes your local image available inside the minikube cluster
        bat 'minikube image load my-react-app:latest'
      }
    }
    stage('Deploy to Kubernetes') {
      steps {
        bat 'kubectl apply -f k8s-deployment.yaml'
      }
    }
    stage('Verify Deployment') {
      steps {
        bat 'kubectl rollout status deployment/my-react-app'
      }
    }
  }
}