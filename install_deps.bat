@echo off
echo Setting up environment...
set PATH=%PATH%;C:\Program Files\nodejs
cd /d C:\Users\henry\CODE\daswos
echo Installing dependencies...
call npm install
echo.
echo If installation was successful, you can start the application with:
echo npm run start-dev
pause
