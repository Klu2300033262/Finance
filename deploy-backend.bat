@echo off
REM 🚀 Separate Backend Deployment Script

echo 🚀 Deploying SpendWise Backend separately...

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ❌ backend\.env file not found.
    echo    Please create backend\.env with your MongoDB configuration:
    echo.
    echo    PORT=5000
    echo    NODE_ENV=production
    echo    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true^&w=majority
    echo    JWT_SECRET=your-32-character-random-secret-key-here
    echo    JWT_EXPIRE=7d
    echo    FRONTEND_URL=https://your-frontend-domain.com
    echo.
    pause
    exit /b 1
)

REM Check if JWT secret is properly configured
findstr /C:"JWT_SECRET=" "backend\.env >nul
if %errorlevel% neq 0 (
    echo ❌ JWT_SECRET not properly configured in backend\.env
    pause
    exit /b 1
)

REM Check MongoDB URI
findstr /C:"MONGODB_URI=" "backend\.env >nul
if %errorlevel% neq 0 (
    echo ❌ MONGODB_URI not found in backend\.env
    pause
    exit /b 1
)

echo ✅ Backend environment validated

REM Install dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Test backend start
echo 🧪 Testing backend startup...
cd backend
call npm run start:prod &
BACKEND_PID=%!

REM Wait for backend to start
timeout /t 10 /nobreak >nul 2>nul
ping 127.0.0.1 -n 2 >nul

REM Test health endpoint
curl -s http://localhost:5000/api/health >nul
if %errorlevel% equ 0 (
    echo ✅ Backend health check passed
    taskkill /F /PID %BACKEND_PID% 2>nul
) else (
    echo ❌ Backend health check failed
    taskkill /F /PID %BACKEND_PID% 2>nul
    echo.
    echo 🔍 Please check:
    echo    1. MongoDB connection string
    echo    2. JWT secret length (minimum 32 characters)
    echo    3. Port availability
    pause
    exit /b 1
)

cd ..

echo.
echo 📋 Backend Deployment Options:
echo 1. Railway:     npm run deploy:railway
echo 2. Render:      npm run deploy:render
echo 3. Heroku:      npm run deploy:heroku
echo 4. DigitalOcean: npm run deploy:do
echo 5. AWS EC2:     npm run deploy:aws
echo 6. PM2 (VPS):    npm run deploy:pm2

echo.
echo 🚀 Choose deployment method:
echo    1) Railway (Recommended - Free & Easy)
echo    2) Render (Free Tier Available)
echo    3) Heroku (Easy to Start)
echo    4) DigitalOcean (Full Control)
echo    5) AWS EC2 (Enterprise)
echo    6) PM2 (VPS Management)

set /p choice=
echo Enter deployment option (1-6): 
if "%choice%"=="" set choice=1
if "%choice%"=="1" (
    echo 🚀 Deploying to Railway...
    cd backend
    npm run deploy:railway
    cd ..
) else if "%choice%"=="2" (
    echo 🚀 Deploying to Render...
    cd backend
    npm run deploy:render
    cd ..
) else if "%choice%"=="3" (
    echo 🚀 Deploying to Heroku...
    cd backend
    npm run deploy:heroku
    cd ..
) else if "%choice%"=="4" (
    echo 🚀 Deploying to DigitalOcean...
    echo.
    echo 📋 DigitalOcean VPS Deployment Steps:
    echo    1. Create Ubuntu 22.04 droplet
    echo    2. SSH into server: ssh root@your-server-ip
    echo    3. Run: curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
    echo    4. Run: git clone https://github.com/your-username/your-repo.git
    echo    5. Run: cd your-repo ^& npm run install:all
    echo    6. Run: cp backend\.env.example backend\.env
    echo    7. Edit backend\.env with your values
    echo    8. Run: npm run build ^& cd backend ^& pm2 start server.js --name "spendwise-backend"
    echo    9. Run: pm2 save ^& pm2 startup
    echo.
    pause
) else if "%choice%"=="5" (
    echo 🚀 Deploying to AWS EC2...
    echo.
    echo 📋 AWS EC2 Deployment Steps:
    echo    1. Create Ubuntu 22.04 EC2 instance
    echo    2. Configure security group (port 5000)
    echo    3. SSH into server: ssh -i your-key.pem ubuntu@your-ec2-ip
    echo    4. Follow steps in BACKEND_DEPLOYMENT.md
    echo.
    pause
) else if "%choice%"=="6" (
    echo 🚀 Setting up PM2 for VPS...
    echo.
    echo 📋 PM2 VPS Deployment Steps:
    echo    1. SSH into your server
    echo    2. Run: npm install -g pm2
    echo    3. Clone your repository
    echo    4. Run: npm run install:all
    echo    5. Configure environment variables
    echo    6. Run: cd backend ^& pm2 start server.js --name "spendwise-backend"
    echo    7. Run: pm2 save ^& pm2 startup
    echo.
    pause
) else (
    echo ❌ Invalid option
    pause
    exit /b 1
)

echo.
echo ✅ Backend deployment preparation completed!
echo 📋 See BACKEND_DEPLOYMENT.md for detailed instructions
echo 🎉 Your backend is ready for separate deployment!
