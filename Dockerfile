FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and theme.json
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY theme.json ./

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci

# Create a custom build script
RUN echo '#!/bin/sh\nset -e\necho "Building client..."\nnpx vite build\necho "Building server..."\nmkdir -p dist/server\ncp -r server/* dist/server/\ncp -r shared dist/\necho "Build completed successfully!"' > build.sh && chmod +x build.sh

# Run the custom build script
RUN ./build.sh

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server/index.js"]
