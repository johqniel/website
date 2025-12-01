#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping application..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting Chat Application..."

# 1. Setup Environment
# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Activate Python venv
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Error: Python virtual environment 'venv' not found. Run setup_vm.sh first."
    exit 1
fi

# 2. Start Backend
echo "Starting Python backend..."
# Assuming chat_server.py is the main entry point. Adjust if needed.
python python/chat_server.py &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 2

# 3. Start Frontend
echo "Starting React frontend..."
echo "The application will be available at http://<YOUR_SERVER_IP>:3000"
# HOST=0.0.0.0 allows access from outside the VM
HOST=0.0.0.0 npm start

# Wait for background processes (if npm start exits, we exit)
wait
