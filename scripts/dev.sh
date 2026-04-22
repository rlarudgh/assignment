#!/bin/bash
set -euo pipefail

echo "=== Starting Development Environment ==="

# Start MySQL
docker compose up -d mysql

# Backend
echo "Starting backend..."
cd backend
./gradlew bootRun &
BACKEND_PID=$!
cd ..

# Frontend
echo "Starting frontend..."
cd frontend
bun dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Development servers running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all servers"

cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker compose down
    exit 0
}
trap cleanup INT TERM

wait
