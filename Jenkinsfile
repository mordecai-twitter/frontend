node {
  stage('SCM') {
    checkout scm
  }
  
  stage('SonarQube Analysis') {
    def scannerHome = tool 'SonarScannerMordecai';
    withSonarQubeEnv() {
      sh "${scannerHome}/bin/sonar-scanner"
    }
  }
}
