@echo off
setlocal EnableDelayedExpansion
title ATEM WEB MANAGER - SECURE WIPE
cd /d "%~dp0\.."
set "PROJECT_ROOT=%CD%"

echo =========================================================================
echo  ATEM WEB MANAGER - SECURE WORKSPACE WIPE (v2.23.0)
echo =========================================================================
echo.

set "TOKEN_FILE=.atem_workspace_token"
set "EXPECTED_KEY=ATEM_MANAGER_SECURE_WIPE_KEY_2026"

:: 1. Verify Token Existence
if not exist "%TOKEN_FILE%" (
    echo [ERROR] Security token file '%TOKEN_FILE%' not found!
    echo This directory is NOT protected for safe wiping. Aborting to protect drive.
    pause
    exit /b 1
)

:: 2. Verify Token Contents
set /p FILE_KEY=<"%TOKEN_FILE%"
if "!FILE_KEY!" NEQ "%EXPECTED_KEY%" (
    echo [ERROR] Token mismatch! Found: !FILE_KEY!
    echo Secure wipe aborted to protect the hard drive.
    pause
    exit /b 1
)

echo [WARNING] Security token verified. 
echo The ENTIRE project folder will be PERMANENTLY DELETED.
echo Target: %PROJECT_ROOT%
echo.
pause

echo [INFO] Terminating active Node.js / Vite processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul

echo [INFO] Handing deletion off to temporary ghost script to bypass file locks...

:: Create ghost wiper in TEMP folder
set "GHOST_SCRIPT=%TEMP%\atem_wiper.bat"
echo @echo off > "%GHOST_SCRIPT%"
echo echo Wiping folder... please wait 3 seconds for file locks to release... >> "%GHOST_SCRIPT%"
echo timeout /t 3 /nobreak ^>nul >> "%GHOST_SCRIPT%"
echo rmdir /s /q "%PROJECT_ROOT%" >> "%GHOST_SCRIPT%"
echo echo. >> "%GHOST_SCRIPT%"
echo echo [SUCCESS] Secure wipe complete. ATEM_WEB_MANAGER has been deleted. >> "%GHOST_SCRIPT%"
echo pause >> "%GHOST_SCRIPT%"
echo del "%%~f0" >> "%GHOST_SCRIPT%"

:: Launch ghost script and kill this console
start "" "%GHOST_SCRIPT%"
exit