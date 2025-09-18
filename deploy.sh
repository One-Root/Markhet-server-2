#!/bin/bash
set -e

# -----------------------------
# CONFIGURATION
# -----------------------------
AWS_REGION="ap-south-1"
ECR_URL="050451360524.dkr.ecr.ap-south-1.amazonaws.com/markhet-v2-dev"
IMAGE_NAME="markhet-server-v2-dev"
EC2_USER="ubuntu"
EC2_IP="http://13.204.39.133:8001"
ENV_FILE_PATH="~/deployments/.env.dev"
CONTAINER_NAME="markhet-server-dev"
PORT_MAPPING="8001:8001"
NETWORK_NAME="markhet-net"

# -----------------------------
# STEP 1: Build Docker Image Locally
# -----------------------------
echo "🚀 Building Docker image..."
docker build -t $IMAGE_NAME .

# -----------------------------
# STEP 2: Tag Image for AWS ECR
# -----------------------------
echo "🏷  Tagging image for ECR..."
docker tag $IMAGE_NAME:latest $ECR_URL:latest

# -----------------------------
# STEP 3: Login to AWS ECR Locally
# -----------------------------
echo "🔑 Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL

# -----------------------------
# STEP 4: Push Image to ECR
# -----------------------------
echo "📤 Pushing image to ECR..."
docker push $ECR_URL:latest

# -----------------------------
# STEP 5: SSH into EC2 and Deploy
# -----------------------------
echo "🌍 Deploying to EC2..."
ssh $EC2_USER@$EC2_IP << EOF
  set -e
  echo "🔑 Logging into AWS ECR on EC2..."
  aws ecr get-login-password --region $AWS_REGION | sudo docker login --username AWS --password-stdin $ECR_URL

  echo "📥 Pulling latest image..."
  sudo docker pull $ECR_URL:latest

  echo "🛑 Stopping old container..."
  sudo docker stop $CONTAINER_NAME || true
  sudo docker rm $CONTAINER_NAME || true

  echo "🚀 Starting new container..."
  sudo docker run -d \
    --name $CONTAINER_NAME \
    --env-file $ENV_FILE_PATH \
    --network $NETWORK_NAME \
    -p $PORT_MAPPING \
    $ECR_URL:latest

  echo "✅ Deployment complete!"
EOF
