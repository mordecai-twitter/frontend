pipeline {
  agent any
 
  tools {nodejs "node"}

  stages {
    stage('SCM') {
      checkout scm
    }
  }
  stage('SonarQube Analysis') {
    def scannerHome = tool 'SonarQubeMordecai';
    withSonarQubeEnv() {
      sh "${scannerHome}/bin/sonar-scanner"
    }
  }
  stage('Test') {
    sh 'ls -al'
  }
}
