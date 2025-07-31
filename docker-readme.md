# 🚀 Markhet Server: Docker + AWS ECR + EC2 Deployment Guide

This markdown contains all the necessary commands (with comments) to:

1. Build Docker image locally
2. Push to AWS ECR
3. Deploy & run on EC2 using `.env` files

---

## 📦 Step 1: Build Docker Image Locally

```bash
# Build the Docker image from your Dockerfile
docker build -t markhet-server .

# Tag the image for pushing to ECR (update repo if needed)
docker tag markhet-server:latest 050451360524.dkr.ecr.ap-south-1.amazonaws.com/markhet-server:latest

# Authenticate Docker to your AWS ECR repository
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 050451360524.dkr.ecr.ap-south-1.amazonaws.com

# Push your local Docker image to ECR
docker push 050451360524.dkr.ecr.ap-south-1.amazonaws.com/markhet-server:latest

# Connect to your EC2 server (replace with your IP)
ssh ubuntu@<your-ec2-ip>

# First authenticate to ECR
aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 050451360524.dkr.ecr.ap-south-1.amazonaws.com

# Then pull the latest image
sudo docker pull 050451360524.dkr.ecr.ap-south-1.amazonaws.com/markhet-server:latest

# Stop & remove old dev container if needed
sudo docker stop markhet-server-dev
sudo docker rm markhet-server-dev

# Deploying the dev
sudo docker run -d \
  --name markhet-server-dev \
  --env-file /home/ubuntu/deployments/.env.dev \
  --network markhet-network \
  -p 8001:8001 \
  050451360524.dkr.ecr.ap-south-1.amazonaws.com/markhet-server:latest

```
