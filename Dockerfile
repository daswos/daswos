FROM node:20.11-slim AS builder

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
RUN echo '#!/bin/sh\nset -e\necho "Building client..."\nnpx vite build\necho "Building server..."\nmkdir -p dist/server dist/shared\ncp -r server/* dist/server/\ncp -r shared/* dist/shared/\necho "Creating server entry point..."\necho "require(\\\"./server/index.js\\\");" > dist/index.js\necho "Build completed successfully!"' > build.sh && chmod +x build.sh

# Run the custom build script
RUN ./build.sh

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
CMD ["node", "dist/index.js"]
