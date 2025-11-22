# Use Node.js 20 as the base image
FROM node:20-slim AS base

# Set working directory
WORKDIR /app

# Enable corepack for pnpm/yarn support if needed (optional but good practice)
RUN corepack enable

# Stage 1: Build
FROM base AS build

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM base AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Copy built artifacts from build stage
COPY --from=build /app/.output /app/.output

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", ".output/server/index.mjs"]
