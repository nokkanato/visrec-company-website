#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="visual-record"
REGION="asia-southeast1" # Change this to your preferred region
SERVICE_NAME="nuxt-app"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Deploying to Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"

# Build and submit the image to Cloud Build
echo "Building container image..."
gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "Deployment complete!"
