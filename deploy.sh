#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Build and deploy functions
echo "Building functions..."
cd functions
npm ci
npm run build
cd ..

# Deploy to Firebase
echo "Deploying to Firebase..."
firebase deploy

echo "Deployment complete!"
