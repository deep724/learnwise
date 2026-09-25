@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not on PATH. Install Node.js, then run this file again.
  pause
  exit /b 1
)
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm is not available. Repair your Node.js installation, then run this file again.
  pause
  exit /b 1
)
if exist "node_modules\vite\bin\vite.js" goto run
if exist "learnwise\node_modules\vite\bin\vite.js" goto run
echo Installing LearnWise dependencies...
call npm.cmd install
if errorlevel 1 (
  echo Dependency installation failed. Check the message above and your internet connection.
  pause
  exit /b 1
)
:run
echo Starting LearnWise. Keep this window open while using the website.
echo Select Explore as Student or Explore as Professor to enter the application.
call npm.cmd run dev -- --open %*
if errorlevel 1 (
  echo LearnWise could not start. Review the error above.
  pause
  exit /b 1
)
