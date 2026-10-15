@echo off
title PharmaHub - Pharmacy Management System
echo ========================================================
echo Starting PharmaHub Pharmacy System...
echo ========================================================
echo.
cd /d "%~dp0"
echo Server starting on http://localhost:5000 ...
start http://localhost:5000
node server/index.js
pause
