@echo off
:: =========================================================================
:: ATEM WEB MANAGER - WINDOWS QUICK PUSH UTILITY (v2.05)
:: =========================================================================
TITLE ATEM Web Manager - Push to GitHub
color 0B
cls

cd /d "%~dp0.."

echo ================================================================
echo        ATEM WEB MANAGER - QUICK PUSH TO GITHUB (v2.05)
echo ================================================================

git status
echo.
set /p "COMMIT_MSG=Enter your commit message: "
if "%COMMIT_MSG%"=="" set "COMMIT_MSG=fix: project update"

echo [*] Staging all changes...
git add -A

echo [*] Committing with message: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%"

echo [*] Pushing to GitHub (main branch)...
git push origin main

echo ================================================================
echo    SUCCESSFULLY PUSHED TO GITHUB!
echo ================================================================
pause