#!/bin/bash

# This script will clean up redundant files after moving to monorepo structure

echo "Starting cleanup process..."

# Redundant directories (already moved to apps/ and packages/)
echo "Removing redundant directories..."
rm -rf client
rm -rf server
rm -rf shared

# Redundant configuration files (now have app-specific versions)
echo "Removing redundant configuration files..."
rm -f Dockerfile
rm -f fly.toml
rm -f package.json.original
rm -f package.json.monorepo
rm -f root-package.json

# Keep these important files:
# - migrations/ (database schema)
# - scripts/ (deployment and utility scripts)
# - .env.production and .env.development (environment configuration)
# - MONOREPO_README.md (documentation)

echo "Cleanup completed successfully!"
