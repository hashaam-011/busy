#!/bin/bash

echo "🚀 Starting MCP CV & Email Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your SMTP settings before running again."
    echo "   Required: SMTP_USER, SMTP_PASS"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Build the server
echo "🔨 Building server..."
npm run build

# Build the frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Start the API server in background
echo "🌐 Starting API server on port 3001..."
npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start the frontend
echo "🎨 Starting frontend on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!

echo "✅ Application started successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 API Server: http://localhost:3001"
echo "🏥 Health Check: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap "echo '🛑 Stopping services...'; kill $SERVER_PID $FRONTEND_PID; exit" INT
wait