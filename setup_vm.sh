#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting setup for Chat Application on Ubuntu..."

# 1. Update System
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install System Dependencies
echo "Installing system dependencies..."
sudo apt-get install -y curl git build-essential python3-venv cmake

# 3. Install Node.js (v20) using nvm
echo "Installing nvm (Node Version Manager)..."
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

echo "Installing Node.js v20..."
nvm install 20
nvm use 20
nvm alias default 20

# Verify Node.js installation
node -v
npm -v

# 4. Install Frontend Dependencies
echo "Installing frontend dependencies..."
if [ -f "package.json" ]; then
    npm install
else
    echo "Error: package.json not found in the current directory."
    exit 1
fi

# 5. Setup Python Backend
echo "Setting up Python backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies from requirements.txt..."
    # Install torch first if specific version needed, but requirements.txt handles it.
    # Note: llama-cpp-python might need CMAKE_ARGS="-DGGML_CUDA=on" if GPU is available,
    # but we'll stick to CPU default for a generic VM setup unless specified.
    pip install -r requirements.txt
else
    echo "Warning: requirements.txt not found."
fi

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo "To start the application:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Start the backend servers (e.g., python python/chat_server.py)"
echo "3. Start the frontend: npm start"
