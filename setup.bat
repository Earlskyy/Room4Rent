@echo off
REM Room Rental Management System - Quick Start Script for Windows

echo.
echo 🚀 Room Rental Management System - Setup Script
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v16+
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Backend Setup
echo 📦 Setting up Backend...
cd backend

if not exist ".env" (
    echo    Creating .env file...
    copy .env.example .env >nul
    echo    ⚠️  Please update .env with your database connection string
    echo    Database URL example: postgresql://user:password@host:5432/room4rent
)

echo    Installing dependencies...
call npm install

echo.
echo 🗄️  Initializing database...
call npm run migrate

echo.
cd ..

REM Frontend Setup
echo 🎨 Setting up Frontend...
cd frontend

if not exist ".env.local" (
    echo    Creating .env.local file...
    copy .env.local.example .env.local >nul
)

echo    Installing dependencies...
call npm install

echo.
cd ..

echo.
echo ✅ Setup Complete!
echo.
echo 📝 Next Steps:
echo    1. Update backend\.env with your PostgreSQL connection string
echo    2. Open two Command Prompts
echo    3. In Terminal 1: cd backend ^&^& npm run dev
echo    4. In Terminal 2: cd frontend ^&^& npm run dev
echo    5. Visit http://localhost:3000 in your browser
echo    6. Login with admin@room4rent.com / admin123
echo.
echo 📖 For detailed setup instructions, see SETUP.md
echo.
pause
