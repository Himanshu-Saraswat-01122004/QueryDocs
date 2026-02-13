#!/bin/bash

################################################################################
# QueryDocs EC2 Startup Script
# This script sets up and starts the QueryDocs application on AWS EC2
################################################################################

set -e  # Exit on error

echo "=========================================="
echo "QueryDocs EC2 Startup Script"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

################################################################################
# 1. System Update and Prerequisites
################################################################################
print_info "Step 1: Installing system prerequisites..."

# Update system packages
sudo apt-get update -y
sudo apt-get upgrade -y

# Install essential tools
sudo apt-get install -y curl wget git build-essential

print_success "System prerequisites installed"

################################################################################
# 2. Install Node.js (v18+)
################################################################################
print_info "Step 2: Installing Node.js..."

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_success "Node.js $(node -v) is already installed"
    else
        print_info "Node.js version is too old. Installing Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
else
    print_info "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

print_success "Node.js $(node -v) installed"
print_success "npm $(npm -v) installed"

################################################################################
# 3. Install Docker and Docker Compose
################################################################################
print_info "Step 3: Installing Docker and Docker Compose..."

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    print_success "Docker is already installed"
else
    print_info "Installing Docker..."
    
    # Install Docker
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed"
fi

# Check if Docker Compose is already installed
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose is already installed"
else
    print_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
fi

################################################################################
# 4. Environment Configuration
################################################################################
print_info "Step 4: Checking environment configuration..."

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    print_error "server/.env file not found!"
    print_info "Creating template server/.env file..."
    cat > server/.env << 'EOF'
GOOGLE_API_KEY=your_google_api_key_here
NODE_ENV=production
PORT=4001
EOF
    print_info "Please edit server/.env and add your GOOGLE_API_KEY"
    print_info "Get your API key from: https://ai.google.dev/"
    exit 1
fi

if [ ! -f "querydocs/.env.local" ]; then
    print_error "querydocs/.env.local file not found!"
    print_info "Creating template querydocs/.env.local file..."
    cat > querydocs/.env.local << 'EOF'
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:4001
EOF
    print_info "Please edit querydocs/.env.local and add your Clerk API keys"
    print_info "Get your keys from: https://clerk.com/"
    exit 1
fi

print_success "Environment files configured"

################################################################################
# 5. Start Infrastructure Services (Docker Compose)
################################################################################
print_info "Step 5: Starting infrastructure services..."

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Start Qdrant and Valkey
docker-compose up -d

# Wait for services to be ready
print_info "Waiting for services to start..."
sleep 5

# Check if services are running
if docker ps | grep -q "valkey"; then
    print_success "Valkey is running"
else
    print_error "Valkey failed to start"
    exit 1
fi

if docker ps | grep -q "qdrant"; then
    print_success "Qdrant is running"
else
    print_error "Qdrant failed to start"
    exit 1
fi

################################################################################
# 6. Install Backend Dependencies
################################################################################
print_info "Step 6: Installing backend dependencies..."

cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages..."
    npm install
else
    print_success "Backend dependencies already installed"
fi

cd ..

print_success "Backend dependencies ready"

################################################################################
# 7. Install Frontend Dependencies
################################################################################
print_info "Step 7: Installing frontend dependencies..."

cd querydocs

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages..."
    npm install
else
    print_success "Frontend dependencies already installed"
fi

cd ..

print_success "Frontend dependencies ready"

################################################################################
# 8. Build Frontend for Production
################################################################################
print_info "Step 8: Building frontend for production..."

cd querydocs
npm run build
cd ..

print_success "Frontend built successfully"

################################################################################
# 9. Create uploads directory
################################################################################
print_info "Step 9: Creating uploads directory..."

mkdir -p server/uploads

print_success "Uploads directory created"

################################################################################
# 10. Start Application Services
################################################################################
print_info "Step 10: Starting application services..."

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2 process manager..."
    sudo npm install -g pm2
    print_success "PM2 installed"
fi

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start backend API server
print_info "Starting backend API server..."
cd server
pm2 start index.js --name "querydocs-api" --watch
cd ..

# Start backend worker
print_info "Starting backend worker..."
cd server
pm2 start worker.js --name "querydocs-worker" --watch
cd ..

# Start frontend
print_info "Starting frontend server..."
cd querydocs
pm2 start npm --name "querydocs-frontend" -- start
cd ..

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup | tail -n 1 | sudo bash || true

print_success "All services started successfully"

################################################################################
# 11. Display Status
################################################################################
echo ""
echo "=========================================="
echo "QueryDocs is now running!"
echo "=========================================="
echo ""
print_success "Services Status:"
pm2 status
echo ""
print_info "Access the application:"
echo "  Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "  Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):4001"
echo ""
print_info "Infrastructure Services:"
echo "  Qdrant: http://localhost:6333"
echo "  Valkey: localhost:6379 (mapped from host port 6382)"
echo ""
print_info "Useful Commands:"
echo "  View logs: pm2 logs"
echo "  Restart all: pm2 restart all"
echo "  Stop all: pm2 stop all"
echo "  View status: pm2 status"
echo "  View Docker containers: docker ps"
echo ""
print_info "Security Note:"
echo "  Make sure to configure your EC2 Security Group to allow:"
echo "  - Port 3000 (Frontend)"
echo "  - Port 4001 (Backend API)"
echo "  - Port 22 (SSH)"
echo ""
print_success "Setup complete! 🚀"
