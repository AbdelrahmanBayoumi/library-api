# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Install only production dependencies
# This ensures that devDependencies are not included in the final image
RUN npm ci --only=production

# Expose the application port
EXPOSE 3000
CMD ["node", "dist/main.js"]
