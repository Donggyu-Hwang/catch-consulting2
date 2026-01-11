# EC2 Ubuntu 배포 가이드

## 사전 준비

### 1. EC2 서버 접속
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Node.js 설치 (v18)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v18.x.x 확인
npm -v
```

### 4. Nginx 설치
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. PM2 설치
```bash
sudo npm install -g pm2
```

### 6. Git 설치 및 레포지토리 클론
```bash
sudo apt install -y git
cd /home/ubuntu
git clone <your-repo-url> catch-consulting
cd catch-consulting
```

---

## 프로젝트 설정

### 1. 의존성 설치
```bash
# 백엔드
cd /home/ubuntu/catch-consulting/server
npm install --production

# 프론트엔드
cd /home/ubuntu/catch-consulting/client
npm install
```

### 2. 프론트엔드 빌드
```bash
cd /home/ubuntu/catch-consulting/client
npm run build
```

### 3. 로그 디렉토리 생성
```bash
cd /home/ubuntu/catch-consulting
mkdir -p logs
```

---

## Nginx 설정

### 1. 기본 설정 백업
```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
```

### 2. 설정 파일 복사
```bash
sudo cp /home/ubuntu/catch-consulting/nginx.conf /etc/nginx/sites-available/default
```

### 3. Nginx 설정 테스트
```bash
sudo nginx -t
```

### 4. Nginx 재시작
```bash
sudo systemctl reload nginx
```

---

## PM2 설정

### 1. ecosystem.config.js 수정
```bash
nano /home/ubuntu/catch-consulting/ecosystem.config.js
```

아래 항목들을 수정하세요:
- `host`: EC2 퍼블릭 IP
- `repo`: Git 레포지토리 주소

### 2. PM2 시작
```bash
cd /home/ubuntu/catch-consulting
pm2 start ecosystem.config.js
```

### 3. PM2 상태 확인
```bash
pm2 status
pm2 logs
```

### 4. PM2 부팅 시 자동 시작
```bash
pm2 startup
# 나온 명령을 복사해서 실행
pm2 save
```

---

## 방화벽 설정

### 1. 포트 허용
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. EC2 Security Group에서 포트 열기
AWS Console → EC2 → Security Groups → Inbound Rules:
- HTTP (80)
- HTTPS (443)
- SSH (22)

---

## 배포 스크립트 사용

### 1. 배포 스크립트 권한 부여
```bash
chmod +x /home/ubuntu/catch-consulting/deploy.sh
```

### 2. 배포 실행
```bash
cd /home/ubuntu/catch-consulting
./deploy.sh
```

---

## 수동 배포 (코드 업데이트 시)

```bash
cd /home/ubuntu/catch-consulting
git pull origin main

# 백엔드
cd server
npm install --production

# 프론트엔드
cd ../client
npm install
npm run build

# PM2 재시작
cd /home/ubuntu/catch-consulting
pm2 reload catch-consulting-api

# Nginx 재시작
sudo systemctl reload nginx
```

---

## 상태 확인

### PM2 상태
```bash
pm2 status
pm2 logs catch-consulting-api
pm2 monit
```

### Nginx 상태
```bash
sudo systemctl status nginx
```

### 로그 확인
```bash
# PM2 로그
tail -f /home/ubuntu/catch-consulting/logs/pm2-error.log
tail -f /home/ubuntu/catch-consulting/logs/pm2-out.log

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
```

---

## 문제 해결

### PM2가 시작되지 않을 때
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### Nginx 502 오류
```bash
# PM2가 실행 중인지 확인
pm2 status

# 포트 확인
sudo netstat -tlnp | grep 3001
```

### 프론트엔드 빌드 오류
```bash
cd /home/ubuntu/catch-consulting/client
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 도메인 연결 (선택)

### 1. 도메인 구매 후 DNS 설정
A 레코드: `your-domain.com` → EC2 퍼블릭 IP

### 2. Nginx 설정 수정
```bash
sudo nano /etc/nginx/sites-available/default
```
`server_name _;`를 `server_name your-domain.com;`으로 변경

### 3. Nginx 재시작
```bash
sudo systemctl reload nginx
```

---

## HTTPS/SSL 설정 (선택 - Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
