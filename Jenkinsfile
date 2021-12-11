node {
  stage('SCM') {
    checkout scm
  }
  stage('Test') {
    try {
      sh "npm install --save"
    } catch (err) {
      echo "Failed: ${err}"
    }
    try {
      sh "yarn install --save"
    } catch (err) {
        echo "Failed: ${err}"
    }
    try {
      sh "npm test"
    } catch (err) {
        echo "Failed: ${err}"
    }
  }
  stage('SonarQube Analysis') {
    try {
      def scannerHome = tool 'SonarQubeMordecai';
      withSonarQubeEnv() {
        sh "${scannerHome}/bin/sonar-scanner"
      }
    } catch (err) {
      echo "Failed: ${err}"
    }
  }
  stage('Deploy') {
    sh "yarn install --save"
    sh "yarn generate"
    try {
      sh "ssh-keyscan -H azucena.cs.unibo.it >> ~/.ssh/known_hosts"
      sh "scp -r dist/* andrea.zecca3@azucena.cs.unibo.it:/home/web/site202137/html"
    } catch (err1) {
      try {
        sh "ssh-keyscan -H marullo.cs.unibo.it >> ~/.ssh/known_hosts"
        sh "scp -r dist/* andrea.zecca3@marullo.cs.unibo.it:/home/web/site202137/html"
      } catch (err2) {
        sh "ssh-keyscan -H ines.cs.unibo.it >> ~/.ssh/known_hosts"
        sh "scp -r dist/* andrea.zecca3@ines.cs.unibo.it:/home/web/site202137/html"
      }
    }
  }
}
