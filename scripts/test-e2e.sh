#!/bin/bash

set -e

echo "Running E2E tests..."

echo "Starting server..."
cd server
pnpm dev &
SERVER_PID=$!
cd ..

echo "Waiting for server..."
sleep 3

echo "Running E2E tests..."
cd web
pnpm test:e2e
cd ..

echo "Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo "E2E tests complete!"
