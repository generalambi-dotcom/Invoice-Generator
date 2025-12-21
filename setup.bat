@echo off
echo 🚀 Setting up Invoice Generator...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Setup complete!
    echo.
    echo To start the development server, run:
    echo   npm run dev
    echo.
    echo Then open http://localhost:3000 in your browser.
) else (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
    exit /b 1
)

