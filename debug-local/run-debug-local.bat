@echo off
echo Running Debug-Local Utility...
echo.

node "%~dp0debug-local.js" fix

echo.
echo Fixes applied. Press any key to test the server...
pause > nul
cd C:\Users\chris\Desktop\FOMOBot
npm run dev
