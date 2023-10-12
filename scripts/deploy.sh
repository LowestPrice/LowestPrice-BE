# 프로젝트 위치 설정
REPOSITORY=/home/ubuntu/LowestPrice-BE
BACKEND_ENV_PATH=$REPOSITORY/.env

# 프로젝트 위치로 이동
cd $REPOSITORY

# .env 파일 확인
if [ -f $BACKEND_ENV_PATH ]; then
    source $BACKEND_ENV_PATH
else
    echo "> .env.production 파일이 존재하지 않습니다."
fi

# 의존성 설치
echo "> install dependency"
npm install

# 프로젝트 build
echo "> build application"
nest build

# application 재실행
echo "> reload application"
sudo pm2 reload lowest-price