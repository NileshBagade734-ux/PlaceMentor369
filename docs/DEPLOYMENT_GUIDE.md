# PlaceMentor369 — Production Deployment Guide

Step-by-step instructions for deploying PlaceMentor369 in production environments using Docker, Nginx, and Node.js process managers.

---

## 🐳 Deployment Option 1: Docker Compose (Recommended)

1. Clone the production repository:
   ```bash
   git clone https://github.com/PlaceMentor369/PlaceMentor369.git
   cd PlaceMentor369
   ```

2. Create production `.env` configuration file:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Launch services:
   ```bash
   docker compose up -d --build
   ```

4. Verify running containers:
   ```bash
   docker compose ps
   ```

---

## 🖥️ Deployment Option 2: PM2 & Nginx Reverse Proxy

### 1. Build and Run Backend
```bash
cd backend
npm ci --only=production
pm2 start server.js --name "placementor-backend" -i max
```

### 2. Nginx Reverse Proxy Config (`/etc/nginx/sites-available/placementor`)
```nginx
server {
    listen 80;
    server_name api.placementor.edu;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Request-ID $request_id;
    }
}
```
