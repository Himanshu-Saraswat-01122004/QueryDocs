#!/bin/bash

################################################################################
# QueryDocs Stop Script
# Stops all QueryDocs services
################################################################################

echo "🛑 Stopping QueryDocs services..."

# Stop PM2 processes
if command -v pm2 &> /dev/null; then
    echo "Stopping PM2 processes..."
    pm2 stop all
    echo "✓ PM2 processes stopped"
fi

# Stop Docker containers
if command -v docker-compose &> /dev/null; then
    echo "Stopping Docker containers..."
    docker-compose down
    echo "✓ Docker containers stopped"
fi

echo ""
echo "✅ All services stopped"
echo ""
echo "To start again, run: ./start-ec2.sh or ./quick-start.sh"
