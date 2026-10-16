@echo off
title Green Grid Application Launcher
echo ==================================================
echo   Green Grid - Smart Energy Management Platform
echo ==================================================
echo.

echo [1/3] Starting PostgreSQL 18 Service...
start "PostgreSQL Server" /min "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Users\srive\pgdata"
timeout /t 2 /nobreak >nul

echo [2/3] Starting Express Backend API (Port 5000)...
cd /d "%~dp0server"
start "Green Grid Backend" cmd /k "node dist/server.js"
timeout /t 2 /nobreak >nul

echo [3/3] Starting React Frontend (Port 5173)...
cd /d "%~dp0"
start "Green Grid Frontend" cmd /k "npm --prefix client run dev"

echo.
echo ==================================================
echo Application is running!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo Swagger:  http://localhost:5000/api/docs
echo ==================================================
echo.
pause
