@echo off
title SplitM Local Server
echo ===================================================
echo               Starting SplitM Local Server
echo ===================================================
echo.
echo Checking for Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not found. Please install Python or run with an HTTP server.
    pause
    exit /b
)
echo Python found.
echo.
echo Launching browser to http://localhost:8000 ...
start "" "http://localhost:8000"
echo.
echo Starting Python HTTP Server on port 8000...
echo (Press Ctrl+C inside this window to stop the server)
python -m http.server 8000 -d public
pause
