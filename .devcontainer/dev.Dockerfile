FROM node:20-slim

WORKDIR /app

# Install PostgreSQL client for health checks and other development tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    git \
    curl \
    && apt-get clean

# The rest of the setup will be handled by the devcontainer configuration
# when mounting the source code from the host

# Expose development ports
EXPOSE 5000

# Default command to keep container running
CMD ["sleep", "infinity"]