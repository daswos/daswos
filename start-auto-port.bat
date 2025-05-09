@echo off
echo ============================================================
echo 🚀 Starting Daswos Application...
echo ============================================================
echo.
echo Trying to start on port 3000 (will try alternative ports if needed)
echo.
echo ============================================================
echo.

cd %~dp0

:: Try port 3000 first
set PORT=3000
call :try_port
if %ERRORLEVEL% EQU 0 goto :eof

:: Try port 3003 next
set PORT=3003
call :try_port
if %ERRORLEVEL% EQU 0 goto :eof

:: Try port 3001 next
set PORT=3001
call :try_port
if %ERRORLEVEL% EQU 0 goto :eof

:: If all ports failed, show error
echo All port attempts failed. Please check if you have other applications running on ports 3000, 3001, and 3003.
exit /b 1

:try_port
echo Attempting to start on port %PORT%...
set PORT=%PORT%
npm run dev
if %ERRORLEVEL% EQU 0 (
  exit /b 0
) else (
  echo Port %PORT% is not available. Trying another port...
  exit /b 1
)
