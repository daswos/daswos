FROM node:20.11-slim AS builder

WORKDIR /app

# Copy package files and workspace configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY theme.json ./

# Copy shared packages
COPY packages/shared/ ./packages/shared/

# Copy app source code
COPY apps/daswos-main/ ./apps/daswos-main/

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build:main

# Production stage
FROM node:20.11-slim

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "dist/server/index.js"]
