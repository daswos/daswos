@echo off
echo ============================================================
echo 🐳 Docker Run Script for Daswos
echo ============================================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in your PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Check if docker-compose.yml exists
if not exist docker-compose.yml (
    echo docker-compose.yml not found.
    exit /b 1
)

REM Run the Docker container
echo Starting Daswos application in Docker...
echo.
echo The application will be available at: http://localhost:5000
echo.
docker-compose up -d

if %ERRORLEVEL% NEQ 0 (
    echo Failed to start Docker containers.
    exit /b 1
)

echo.
echo ============================================================
echo 🎉 Success! Daswos is now running in Docker.
echo ============================================================
echo.
echo You can access the application at: http://localhost:5000
echo.
echo To stop the application, run: docker-compose down
echo.

pause
