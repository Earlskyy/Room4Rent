#!/bin/bash

# Room Rental Management System - Quick Start Script
# This script automates the setup process

echo "🚀 Room Rental Management System - Setup Script"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo "   ⚠️  Please update .env with your database connection string"
    echo "   Database URL example: postgresql://user:password@host:5432/room4rent"
fi

echo "   Installing dependencies..."
npm install

echo ""
echo "🗄️  Initializing database..."
npm run migrate

echo ""
cd ..

# Frontend Setup
echo "🎨 Setting up Frontend..."
cd frontend

if [ ! -f ".env.local" ]; then
    echo "   Creating .env.local file..."
    cp .env.local.example .env.local
fi

echo "   Installing dependencies..."
npm install

echo ""
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Update backend/.env with your PostgreSQL connection string"
echo "   2. Open two terminal windows"
echo "   3. In Terminal 1: cd backend && npm run dev"
echo "   4. In Terminal 2: cd frontend && npm run dev"
echo "   5. Visit http://localhost:3000 in your browser"
echo "   6. Login with admin@room4rent.com / admin123"
echo ""
echo "📖 For detailed setup instructions, see SETUP.md"
echo ""
