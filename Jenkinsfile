pipeline {
  agent any

  environment {
    DOCKERHUB_USER = 'deepaksharma611'
    IMAGE_NAME     = "${DOCKERHUB_USER}/my-react-app"
    IMAGE_TAG      = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% ."
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
          bat "docker push %IMAGE_NAME%:%IMAGE_TAG%"
        }
      }
    }

    stage('Load image into kind') {
      steps {
        bat "kind load docker-image %IMAGE_NAME%:%IMAGE_TAG% --name my-cluster"
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        bat "kubectl apply -f k8s-deployment.yaml"
        bat "kubectl set image deployment/my-react-app my-react-app=%IMAGE_NAME%:%IMAGE_TAG%"
        bat "kubectl rollout status deployment/my-react-app"
      }
    }

  }

  post {
    success {
      echo "Successfully deployed ${IMAGE_NAME}:${IMAGE_TAG}"
    }
    failure {
      echo "Pipeline failed — check stage logs above"
    }
  }
}