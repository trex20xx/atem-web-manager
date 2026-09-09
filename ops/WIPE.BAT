@echo off
title ATEM WEB MANAGER - WIPE UTILITY
cd /d "%~dp0\.."

echo =========================================================================
echo  ATEM WEB MANAGER - DEEP CLEAN WORKSPACE (v2.22.0)
echo =========================================================================
echo [WARNING] This will safely delete all generated node_modules, cache,
echo and dist builds to fix dependency errors.
echo.
echo Your source code and .git repository will REMAIN SAFE.
echo.
pause

echo [INFO] Wiping Root node_modules...
if exist "node_modules\" rmdir /s /q "node_modules"
if exist "package-lock.json" del /q "package-lock.json"

echo [INFO] Wiping Bridge node_modules...
if exist "bridge\node_modules\" rmdir /s /q "bridge\node_modules"
if exist "bridge\package-lock.json" del /q "bridge\package-lock.json"

echo [INFO] Wiping Dist builds...
if exist "dist\" rmdir /s /q "dist"

echo.
echo [SUCCESS] Workspace deep cleaned successfully! Run INIT.BAT to rebuild.
echo.
pause