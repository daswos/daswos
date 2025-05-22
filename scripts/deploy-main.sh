#!/bin/bash

# Script to deploy the main app to Fly.io

set -e

echo "Deploying main app to Fly.io..."

# Navigate to the main app directory
cd apps/daswos-main

# Set the DATABASE_URL secret
echo "Setting DATABASE_URL secret..."
fly secrets set DATABASE_URL="$(grep DATABASE_URL ../../.env.production | cut -d '=' -f2-)"

# Set the SESSION_SECRET secret
echo "Setting SESSION_SECRET secret..."
fly secrets set SESSION_SECRET="$(grep SESSION_SECRET ../../.env.production | cut -d '=' -f2-)"

# Set the STRIPE keys
echo "Setting STRIPE keys..."
fly secrets set STRIPE_PUBLISHABLE_KEY="$(grep STRIPE_PUBLISHABLE_KEY ../../.env.production | cut -d '=' -f2-)"
fly secrets set STRIPE_SECRET_KEY="$(grep STRIPE_SECRET_KEY ../../.env.production | cut -d '=' -f2-)"

# Deploy the app
echo "Deploying the app..."
fly deploy

# Add custom domain
echo "Adding custom domain..."
fly ips custom add daswos.com

echo "Deployment completed successfully!"
echo "Now follow the DNS instructions from Fly.io to configure your Cloudflare DNS settings."
