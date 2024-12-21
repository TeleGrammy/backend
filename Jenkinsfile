pipeline{
    agent any
    tools{
        nodejs 'node23'
    }
    environment{
        SONAR_TOKEN = credentials('SONAR_TOKEN')
    }
    stages{
        stage('Paving environment...'){
            steps{
                withCredentials([string(credentialsId:'testing-backend-env', variable:'DOWNLOAD_TESTENV_URL')]){
                    sh('curl -o .env $DOWNLOAD_TESTENV_URL')
                }
                sh "npm install"
            }
        }
        stage('Run tests...'){
            steps{
                timeout(time: 3, unit: 'MINUTES'){
                    sh "npm test"
                }
                script{
                    docker.build('telegrammy/backend')
                }
            }
        }
        stage('Building...'){
            when{
                expression{
                    return !env.CHANGE_ID
                }
            }
            steps{
                script{
                    def tag
                    if(env.BRANCH_NAME.startsWith('module/')){
                        tag = env.BRANCH_NAME.replace('module/','')
                    } else if(env.BRANCH_NAME== 'main'){
                        tag = env.BUILD_NUMBER
                    } else {
                        currentBuild.result = 'SUCCESS'
                        return
                    }
                    docker.withRegistry('https://index.docker.io/v1/','dockerhub-cred'){
                        docker.image('telegrammy/backend').push("${tag}")
                    }
                    sh """
                        /var/lib/jenkins/.sonar/sonar-scanner-6.2.1.4610-linux-x64/bin/sonar-scanner \
                        -Dsonar.organization=telegrammy \
                        -Dsonar.projectKey=TeleGrammy_backend \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=node_modules/**,docs/** \
                        -Dsonar.branch.name=${env.BRANCH_NAME} \
                        -Dsonar.login=${SONAR_TOKEN} \
                        -Dsonar.host.url=https://sonarcloud.io
                    """
                }
            }
        }
        stage('Updating manifests...'){
            when{
                expression{
                    return !env.CHANGE_ID && env.BRANCH_NAME == 'main'
                }
            }
            steps{
                cleanWs()
                withCredentials([string(credentialsId:'gh-pat',variable:'TOKEN'), string(credentialsId: 'manifest-email', variable:'EMAIL')]){
                    sh """
                            git clone "https://x-access-token:${TOKEN}@github.com/telegrammy/devops.git" manifests
                            cd manifests
                            git config user.email "${EMAIL}"
                            git config user.name "mohamedselbohy"
                            sed -i "s+telegrammy/backend.*+telegrammy/backend:${env.BUILD_NUMBER}+g" ./kubernetes/backend/backend-deployment.yml
                            git add .
                            git commit -m "Automated manifest update #${env.BUILD_NUMBER}"
                            git push "https://x-access-token:${TOKEN}@github.com/telegrammy/devops.git" HEAD:main
                        """
                }
            }
        }
    }
    post{
        always{
            cleanWs()
        }
    }
}
