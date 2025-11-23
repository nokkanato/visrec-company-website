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
  --allow-unauthenticated \
  --set-env-vars NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA20tly8-CbtRc-vjWOVDoAvANi_1vaQvA,NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=visual-record.firebaseapp.com,NUXT_PUBLIC_FIREBASE_PROJECT_ID=visual-record,NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=visual-record.firebasestorage.app,NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=724601136304,NUXT_PUBLIC_FIREBASE_APP_ID=1:724601136304:web:bf240cae5e9312b0974775

echo "Deployment complete!"
