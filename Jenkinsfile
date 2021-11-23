node {
  stage('SCM') {
    checkout scm
  }

  stage('SonarQube Analysis') {
    def scannerHome = tool 'SonarQubeMordecai';
    withSonarQubeEnv() {
      sh "${scannerHome}/bin/sonar-scanner"
    }
  }
  stage('Test') {
    sh "npm install --save"
    sh "yarn install --save"
    try {
      sh "npm test"
    }   catch (err) {
        echo "Failed: ${err}"
    }
  }
  stage('Deploy') {
    sh "ssh-keyscan -H marullo.cs.unibo.it >> ~/.ssh/known_hosts"
    sh "yarn install --save"
    sh "yarn generate"
    sh "scp -r dist/* andrea.zecca3@marullo.cs.unibo.it:/home/web/site202137/html"
  }
}
