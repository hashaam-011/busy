@echo off
echo 🚀 Starting MCP CV & Email Server...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from template...
    copy env.example .env
    echo 📝 Please edit .env file with your SMTP settings before running again.
    echo    Required: SMTP_USER, SMTP_PASS
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing server dependencies...
    npm install
)

REM Install frontend dependencies if needed
if not exist frontend\node_modules (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Build the server
echo 🔨 Building server...
npm run build

REM Build the frontend
echo 🔨 Building frontend...
cd frontend
npm run build
cd ..

REM Start the API server
echo 🌐 Starting API server on port 3001...
start "API Server" npm start

REM Wait a moment for server to start
timeout /t 3 /nobreak > nul

REM Start the frontend
echo 🎨 Starting frontend on port 3000...
cd frontend
start "Frontend" npm start
cd ..

echo ✅ Application started successfully!
echo 📱 Frontend: http://localhost:3000
echo 🔧 API Server: http://localhost:3001
echo 🏥 Health Check: http://localhost:3001/api/health
echo.
echo Press any key to stop all services
pause > nul

REM Kill the processes (Windows doesn't have easy process management)
echo 🛑 Stopping services...
taskkill /f /im node.exe > nul 2>&1