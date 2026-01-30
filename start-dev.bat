@echo off
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
rd /s /q ".next" >nul 2>&1
npm run dev
