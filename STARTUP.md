# DASWOS APPLICATION - QUICK START GUIDE

## PREREQUISITES

- Node.js installed (v20 or higher)
- npm installed
- Docker (optional, for containerized deployment)

## STARTUP INSTRUCTIONS

### Local Development

**Option 1: Using Batch File (Easiest)**
```
Double-click the start-auto-port.bat file
```
This script will automatically try ports 3000, 3003, and 3001 if any are already in use.

**Option 2: Using Standard Batch File**
```
Double-click the start.bat file
```

**Option 3: Using PowerShell**
```
Right-click start.ps1 and select "Run with PowerShell"
```
or
```
powershell -ExecutionPolicy Bypass -File start.ps1
```

**Option 4: Using Command Prompt**
```
npm run dev
```

### Docker Deployment

**Option 1: Build and Push Docker Image**
```
Double-click the docker-build-push.bat file
```
This will build the Docker image and push it to Docker Hub using your info@daswos.com account.

**Option 2: Run Docker Container**
```
Double-click the docker-run.bat file
```
This will start the application in a Docker container.

## ACCESS THE APPLICATION

Once started, the application will be available at:
```
http://localhost:5000
```

## TROUBLESHOOTING

If you encounter any issues:

1. Make sure Node.js and npm are installed
2. Try running `npm install` to ensure all dependencies are installed
3. If you see an error about "@shared/schema" not being found:
   - This is a path mapping issue that has been fixed in the latest version
   - If you still encounter it, make sure the tsconfig.json has the correct path mapping
4. If port conflicts occur:
   - Use the start-auto-port.bat file which will try multiple ports
   - Or manually specify a port with: `set PORT=3003 && npm run dev`
5. Database connection issues:
   - Make sure your .env file is properly configured with the database connection string
   - Try running `npm run db:push` to update the database schema
6. Docker issues:
   - Make sure Docker Desktop is installed and running
   - Check if you're logged in to Docker Hub with `docker login`
   - If you get permission errors, try running Docker Desktop as administrator

## COMMON COMMANDS

```
# Install dependencies
npm install

# Start the application (local development)
npm run dev

# Update database schema
npm run db:push

# Build for production
npm run build

# Start in production mode
npm run start

# Docker commands
docker-compose up -d     # Start Docker containers
docker-compose down      # Stop Docker containers
docker-compose logs      # View Docker container logs
```
