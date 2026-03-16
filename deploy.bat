@echo off
REM 🚀 SpendWise MERN App - Production Deployment Script

echo 🚀 Starting SpendWise MERN App Deployment...

REM Check Node.js version
for /f "tokens=2 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version %NODE_VERSION%

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ❌ backend\.env file not found. Please create it with your MongoDB configuration.
    exit /b 1
)

REM Check if MongoDB URI is set
findstr /C:"MONGODB_URI=" "backend\.env" >nul
if %errorlevel% neq 0 (
    echo ❌ MONGODB_URI not found in backend\.env
    exit /b 1
)

REM Check if JWT secret is set
findstr /C:"JWT_SECRET=" "backend\.env" >nul
if %errorlevel% neq 0 (
    echo ❌ JWT_SECRET not found in backend\.env
    exit /b 1
)

echo ✅ Environment variables validated

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
cd backend
call npm install
cd ..

REM Build frontend
echo 🏗️ Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)

echo ✅ Frontend built successfully

echo 🎉 Build completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Set your production domain in .env.production
echo 2. Deploy frontend to your hosting service (Vercel, Netlify, etc.)
echo 3. Deploy backend to your server (VPS, Railway, Render, etc.)
echo 4. Update environment variables with your domain
echo 5. Test your deployed application
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions

pause
