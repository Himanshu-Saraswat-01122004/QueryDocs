# EC2 Deployment Guide for QueryDocs

This guide will help you deploy the QueryDocs application on an AWS EC2 instance.

## 📋 Prerequisites

### AWS EC2 Instance Requirements
- **Instance Type**: t2.medium or larger (minimum 4GB RAM recommended)
- **OS**: Ubuntu 20.04 LTS or later
- **Storage**: At least 20GB
- **Security Group**: Configure inbound rules for:
  - Port 22 (SSH)
  - Port 3000 (Frontend)
  - Port 4001 (Backend API)

### Required API Keys
Before running the script, you'll need:
1. **Google AI API Key** - Get from [Google AI Studio](https://ai.google.dev/)
2. **Clerk API Keys** - Get from [Clerk Dashboard](https://clerk.com/)

## 🚀 Quick Start

### 1. Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/QueryDocs.git
cd QueryDocs
```

### 3. Configure Environment Variables

Create the backend environment file:
```bash
cat > server/.env << EOF
GOOGLE_API_KEY=your_actual_google_api_key_here
NODE_ENV=production
PORT=4001
EOF
```

Create the frontend environment file:
```bash
cat > querydocs/.env.local << EOF
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:4001
EOF
```

### 4. Run the Deployment Script

```bash
chmod +x start-ec2.sh
./start-ec2.sh
```

The script will:
- ✅ Update system packages
- ✅ Install Node.js 18+
- ✅ Install Docker and Docker Compose
- ✅ Start Qdrant and Valkey containers
- ✅ Install all dependencies
- ✅ Build the frontend
- ✅ Start all services using PM2

### 5. Access Your Application

After successful deployment, access your application at:
- **Frontend**: `http://your-ec2-public-ip:3000`
- **Backend API**: `http://your-ec2-public-ip:4001`

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the script fails:

### 1. Install Prerequisites

```bash
# Update system
sudo apt-get update -y && sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Start Infrastructure

```bash
cd QueryDocs
docker-compose up -d
```

### 3. Setup Backend

```bash
cd server
npm install
npm run dev &  # Start API server in background
npm run worker &  # Start worker in background
cd ..
```

### 4. Setup Frontend

```bash
cd querydocs
npm install
npm run build
npm start &  # Start frontend in background
cd ..
```

## 📊 Managing Services

### Using PM2 (Recommended)

The deployment script uses PM2 for process management:

```bash
# View all processes
pm2 status

# View logs
pm2 logs

# View logs for specific service
pm2 logs querydocs-api
pm2 logs querydocs-worker
pm2 logs querydocs-frontend

# Restart all services
pm2 restart all

# Restart specific service
pm2 restart querydocs-api

# Stop all services
pm2 stop all

# Delete all processes
pm2 delete all
```

### Check Docker Containers

```bash
# View running containers
docker ps

# View container logs
docker logs <container-id>

# Restart containers
docker-compose restart
```

## 🔍 Troubleshooting

### Services Not Starting

1. **Check PM2 logs**:
   ```bash
   pm2 logs
   ```

2. **Check Docker containers**:
   ```bash
   docker ps -a
   docker logs <container-name>
   ```

3. **Verify environment variables**:
   ```bash
   cat server/.env
   cat querydocs/.env.local
   ```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill the process
sudo kill -9 <PID>

# Find process using port 4001
sudo lsof -i :4001
sudo kill -9 <PID>
```

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in, or run:
newgrp docker
```

### Out of Memory

If you encounter memory issues:
1. Use a larger EC2 instance (t2.medium or larger)
2. Add swap space:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 🔒 Security Recommendations

### 1. Configure Security Group

In AWS Console:
- Navigate to EC2 → Security Groups
- Edit inbound rules:
  - SSH (22): Your IP only
  - Custom TCP (3000): 0.0.0.0/0 (or specific IPs)
  - Custom TCP (4001): 0.0.0.0/0 (or specific IPs)

### 2. Use HTTPS (Production)

For production, use a reverse proxy like Nginx with SSL:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/querydocs

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 3. Environment Variables

Never commit `.env` files to Git. Use AWS Secrets Manager or Parameter Store for production.

### 4. Firewall

```bash
# Enable UFW firewall
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw allow 4001
sudo ufw enable
```

## 📈 Monitoring

### Check Application Health

```bash
# Backend health check
curl http://localhost:4001/health

# Check if frontend is responding
curl http://localhost:3000
```

### Monitor Resources

```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Docker stats
docker stats
```

## 🔄 Updates and Maintenance

### Update Application Code

```bash
cd QueryDocs
git pull origin main

# Restart services
pm2 restart all
```

### Update Dependencies

```bash
# Backend
cd server
npm update
pm2 restart querydocs-api querydocs-worker

# Frontend
cd ../querydocs
npm update
npm run build
pm2 restart querydocs-frontend
```

### Backup Data

```bash
# Backup Qdrant data
docker exec <qdrant-container> tar czf /tmp/qdrant-backup.tar.gz /qdrant/storage
docker cp <qdrant-container>:/tmp/qdrant-backup.tar.gz ./qdrant-backup.tar.gz

# Backup uploaded files
tar czf uploads-backup.tar.gz server/uploads/
```

## 🛑 Stopping the Application

### Stop All Services

```bash
# Stop PM2 processes
pm2 stop all

# Stop Docker containers
docker-compose down
```

### Complete Cleanup

```bash
# Delete PM2 processes
pm2 delete all

# Remove Docker containers and volumes
docker-compose down -v

# Remove uploaded files (optional)
rm -rf server/uploads/*
```

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify environment variables are set correctly
3. Ensure all ports are open in Security Group
4. Check Docker containers are running: `docker ps`

## 🎯 Next Steps

After deployment:
1. Test file upload functionality
2. Test chat queries
3. Configure domain name (optional)
4. Set up SSL certificate (recommended for production)
5. Configure monitoring and alerts
6. Set up automated backups
