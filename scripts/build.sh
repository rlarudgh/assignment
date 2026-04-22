#!/bin/bash
set -euo pipefail

echo "=== Building Project ==="

echo "[1/2] Building frontend..."
cd frontend
bun run build
cd ..

echo "[2/2] Building backend..."
cd backend
./gradlew build
cd ..

echo "Build complete!"
