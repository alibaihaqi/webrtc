#!/bin/bash

set -e

echo "Deploying WebRTC Video Call..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Install it with: npm install -g @railway/cli"
    exit 1
fi

# Deploy server to Railway
echo "Deploying server to Railway..."
cd server
railway up
cd ..

# Deploy frontend to Vercel
echo "Deploying frontend to Vercel..."
cd web
vercel --prod
cd ..

echo "Deployment complete!"
