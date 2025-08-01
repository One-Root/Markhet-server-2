# Stage 1: Build
FROM node:20 AS build

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependency files and install dependencies
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY .npmrc ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Copy GCP service account key
COPY src/config/gcp-credentials/sa-markhet-developer.json /app/src/config/gcp-credentials/sa-markhet-developer.json

# Build the NestJS application
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only production dependencies
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY .npmrc ./
RUN pnpm install --frozen-lockfile


# Copy built files from the build stage
COPY --from=build /app/dist ./dist

# Copy GCP service account key
COPY --from=build /app/src/config/gcp-credentials/sa-markhet-developer.json /app/src/config/gcp-credentials/sa-markhet-developer.json

# Expose the application port
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/main.js"]
