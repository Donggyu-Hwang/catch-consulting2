module.exports = {
  apps: [
    {
      name: 'catch-consulting-api',
      script: './server/index.js',
      cwd: '/home/ubuntu/catch-consulting',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    }
  ],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'YOUR_EC2_IP',  // EC2 퍼블릭 IP로 변경
      ref: 'origin/main',
      repo: 'git@github.com:YOUR_USERNAME/YOUR_REPO.git',  // 레포지토리 주소로 변경
      path: '/home/ubuntu/catch-consulting',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && cd client && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
