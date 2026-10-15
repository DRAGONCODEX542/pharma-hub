@echo off
title Push PharmaHub to GitHub
echo ========================================================
echo Connecting to GitHub repository...
echo https://github.com/DRAGONCODEX542/pharma-hub.git
echo ========================================================
echo.
cd /d "%~dp0"
echo Pushing your project files to GitHub...
echo (If a browser window opens, please click "Authorize" or "Sign in")
echo.
git push -u origin main
echo.
echo ========================================================
echo All files uploaded successfully!
echo You can now refresh your GitHub page!
echo ========================================================
pause
