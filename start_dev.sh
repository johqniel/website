#!/bin/bash

# Kill child processes (backend) on exit
trap "exit" INT TERM
trap "kill 0" EXIT

echo "=================================================="
echo "Starting Vercel Python Backend (Port 5000)..."
echo "=================================================="

# Ensure dependencies are installed
if [ -f "api/requirements.txt" ]; then
    echo "Checking dependencies..."
    pip3 install -r api/requirements.txt > /dev/null 2>&1
fi

# Run backend in background
python3 api/chat.py &
BACKEND_PID=$!

echo "Backend started with PID $BACKEND_PID"
echo ""
echo "=================================================="
echo "Starting React Frontend (Port 3000)..."
echo "=================================================="

# Run frontend (this will block until stopped)
npm start

wait
