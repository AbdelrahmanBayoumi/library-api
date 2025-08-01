# syntax=docker/dockerfile:1

########################################
# Builder stage: install dependencies, build app
########################################
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package manifests and install all dependencies (development + production)
COPY package*.json ./
RUN npm ci

# Copy source files into container
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Set production environment for pruning
ENV NODE_ENV=production

# Remove development dependencies, keeping only production dependencies
RUN npm prune --production

########################################
# Production stage: minimal runtime image
########################################
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root 'appuser' user and group for better security
RUN addgroup -S appgroup \
 && adduser  -S appuser -G appgroup

# Copy compiled app, production dependencies, package information, and static assets
COPY --from=builder --chown=appuser:appgroup /app/dist      ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/public      ./public

# Switch to the non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Launch the application
CMD ["npm","run","start:prod"]
