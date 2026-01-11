#!/bin/bash

# EC2 배포 스크립트
# 사용법: ./deploy.sh

set -e

echo "========================================="
echo "🚀 Catch Consulting 배포 시작"
echo "========================================="

# 1. 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치 중..."
cd /home/ubuntu/catch-consulting/server
npm install --production

# 2. 프론트엔드 의존성 설치 및 빌드
echo "🔨 프론트엔드 빌드 중..."
cd /home/ubuntu/catch-consulting/client
npm install
npm run build

# 3. PM2 재시작
echo "🔄 PM2 재시작 중..."
cd /home/ubuntu/catch-consulting
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

# 4. PM2 저장 (재부팅 후 자동 시작)
pm2 save
pm2 startup | grep -v "sudo" | sudo $(pm2 startup | grep "sudo" | tail -n 1 | cut -d ' ' -f 4-)

# 5. Nginx 재시작
echo "🌐 Nginx 재시작 중..."
sudo nginx -t && sudo systemctl reload nginx

echo "========================================="
echo "✅ 배포 완료!"
echo "========================================="
echo ""
echo "상태 확인:"
echo "  PM2: pm2 status"
echo "  PM2 로그: pm2 logs"
echo "  Nginx: sudo systemctl status nginx"
echo ""
