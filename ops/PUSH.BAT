@echo off
title ATEM WEB MANAGER - AUTO PUSH
cd /d "%~dp0\.."

echo =========================================================================
echo  ATEM WEB MANAGER - GITHUB AUTO PUSH (v2.22.0)
echo =========================================================================
echo.
set /p desc="Enter your commit description: "

git add -A
git commit -m "%desc%"
git push -u origin main

echo.
echo [SUCCESS] Code safely pushed to GitHub!
pause