@echo off
:: =========================================================================
:: ATEM WEB MANAGER - WINDOWS SECURE FOLDER WIPE UTILITY (v2.05)
:: =========================================================================
TITLE ATEM Web Manager - Safe Workspace Destruction
color 0C
cls

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "SAFETY_TOKEN=%PROJECT_ROOT%\.atem_workspace_token"
set "SECRET_KEY=ATEM_MANAGER_SECURE_WIPE_KEY_2026"

echo ================================================================
echo        ATEM WEB MANAGER - SECURE WORKSPACE ERASURE (v2.05)
echo ================================================================

if not exist "%PROJECT_ROOT%" (
    echo [X] ERROR: Project root not found!
    pause
    exit /b 1
)

echo [*] Verifying safety token in %PROJECT_ROOT%...
if not exist "%SAFETY_TOKEN%" (
    echo [X] ERROR: Safety token missing in project folder! Aborting.
    pause
    exit /b 1
)

set /p TOKEN_CONTENT=<"%SAFETY_TOKEN%"
if not "%TOKEN_CONTENT%"=="%SECRET_KEY%" (
    echo [X] ERROR: Safety token mismatch! Aborting.
    pause
    exit /b 1
)

echo [✓] Safety token verified.
echo [!] WARNING: You are about to COMPLETELY DELETE:
echo     %PROJECT_ROOT%
echo.
set /p "CONFIRM=Are you sure? This cannot be undone! (y/N): "

if /i "%CONFIRM%"=="y" (
    echo [*] Deleting project directory...
    cd /d "%PROJECT_ROOT%\.."
    rmdir /s /q "%PROJECT_ROOT%"
    echo ================================================================
    echo    FOLDER DESTRUCTION COMPLETE. Project successfully erased.
    echo ================================================================
) else (
    echo [*] Wipe aborted.
)
pause