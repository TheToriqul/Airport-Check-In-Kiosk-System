@echo off
REM Cross-platform script to run the entire application
REM Works on Windows
REM Usage: run.bat

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

REM Install root dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    call npm install
)

REM Run the start script
node scripts/start.js

