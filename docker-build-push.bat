@echo off
echo ============================================================
echo 🐳 Docker Build and Push Script for Daswos
echo ============================================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in your PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Ask for Docker Hub credentials
set /p DOCKER_USERNAME=Enter your Docker Hub username (info@daswos.com): 
set /p DOCKER_PASSWORD=Enter your Docker Hub password: 

REM Login to Docker Hub
echo.
echo Logging in to Docker Hub...
docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%
if %ERRORLEVEL% NEQ 0 (
    echo Failed to login to Docker Hub.
    exit /b 1
)

REM Build the Docker image
echo.
echo Building Docker image...
docker build -t daswos/app:latest .
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build Docker image.
    exit /b 1
)

REM Push the Docker image
echo.
echo Pushing Docker image to Docker Hub...
docker push daswos/app:latest
if %ERRORLEVEL% NEQ 0 (
    echo Failed to push Docker image.
    exit /b 1
)

echo.
echo ============================================================
echo 🎉 Success! Docker image has been built and pushed.
echo ============================================================
echo.
echo You can now run the application using:
echo docker-compose up -d
echo.
echo Or pull the image on another machine with:
echo docker pull daswos/app:latest
echo.

pause
