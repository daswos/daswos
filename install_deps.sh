#!/bin/bash
echo "Setting up environment..."
export PATH=$PATH:"/c/Program Files/nodejs"
cd /c/Users/henry/CODE/daswos
echo "Installing dependencies..."
/c/Program\ Files/nodejs/npm.cmd install
echo ""
echo "If installation was successful, you can start the application with:"
echo "npm run start-dev"
