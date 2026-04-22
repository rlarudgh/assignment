#!/bin/bash
set -euo pipefail

echo "=== Assignment Project Setup ==="

# Check Bun
if ! command -v bun &>/dev/null; then
    echo "Error: bun is not installed. Install: https://bun.sh"
    exit 1
fi

# Frontend dependencies
echo "[1/3] Installing frontend dependencies..."
cd frontend
bun install
cd ..

# Backend - Gradle wrapper
echo "[2/3] Setting up backend..."
cd backend
chmod +x gradlew
cd ..

# Docker - MySQL
echo "[3/3] Starting MySQL container..."
docker compose up -d mysql

echo ""
echo "Setup complete!"
echo "  Frontend: cd frontend && bun dev"
echo "  Backend:  cd backend && ./gradlew bootRun"
