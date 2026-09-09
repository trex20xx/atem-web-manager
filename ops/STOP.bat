@echo off
title ATEM WEB MANAGER - STOP DAEMONS
echo =========================================================================
echo  ATEM WEB MANAGER - STOPPING BACKGROUND SERVICES (v2.22.0)
echo =========================================================================
echo.

echo [INFO] Hunting for hidden ATEM Bridge processes on Port 8080...
set "killed=0"

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
    set "killed=1"
)

if "%killed%"=="1" (
    echo [SUCCESS] Hidden background bridge server has been terminated.
) else (
    echo [INFO] No hidden bridge server was found running.
)

echo.
pause