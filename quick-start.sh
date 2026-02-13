#!/bin/bash

################################################################################
# QueryDocs Quick Start Script (Simplified)
# Use this if you already have Node.js and Docker installed
################################################################################

set -e

echo "🚀 Starting QueryDocs..."

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check environment files
if [ ! -f "server/.env" ]; then
    echo "❌ server/.env not found. Please create it with your GOOGLE_API_KEY"
    exit 1
fi

if [ ! -f "querydocs/.env.local" ]; then
    echo "❌ querydocs/.env.local not found. Please create it with your Clerk keys"
    exit 1
fi

# Start Docker services
echo "📦 Starting Docker services..."
docker-compose up -d

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "querydocs/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd querydocs && npm install && cd ..
fi

# Build frontend
echo "🔨 Building frontend..."
cd querydocs && npm run build && cd ..

# Create uploads directory
mkdir -p server/uploads

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing processes
pm2 delete all 2>/dev/null || true

# Start services
echo "🚀 Starting services..."
cd server && pm2 start index.js --name "querydocs-api" && cd ..
cd server && pm2 start worker.js --name "querydocs-worker" && cd ..
cd querydocs && pm2 start npm --name "querydocs-frontend" -- start && cd ..

pm2 save

echo ""
echo "✅ QueryDocs is running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:4001"
echo ""
echo "View logs: pm2 logs"
echo "Stop all: pm2 stop all"
