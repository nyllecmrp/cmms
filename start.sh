#!/bin/bash

echo "===================================="
echo "   Starting CMMS Application"
echo "===================================="
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "===================================="
    echo "   Stopping CMMS Application..."
    echo "===================================="
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C
trap cleanup INT TERM

# Start backend
echo "Starting Backend Server..."
cd backend && npm run start:dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting Frontend Server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "===================================="
echo "   CMMS Application Running!"
echo "===================================="
echo ""
echo "Backend:  http://localhost:3000/api"
echo "Frontend: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for background processes
wait
