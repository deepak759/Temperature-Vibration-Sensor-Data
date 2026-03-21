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
        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
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
    }
  }
}

    stage('Load image into kind') {
      steps {
        sh "kind load docker-image ${IMAGE_NAME}:${IMAGE_TAG} --name my-cluster"
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh "kubectl apply -f k8s-deployment.yaml"
        sh "kubectl set image deployment/my-react-app my-react-app=${IMAGE_NAME}:${IMAGE_TAG}"
        sh "kubectl rollout status deployment/my-react-app"
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