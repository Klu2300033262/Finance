@echo off
REM 🟨 Render Backend Deployment - Windows Version

echo 🚀 Deploying SpendWise Backend to Render...

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ❌ backend\.env file not found.
    echo Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
    echo.
    echo ⚠️  IMPORTANT: Update backend\.env with your actual values:
    echo    - MONGODB_URI: Your MongoDB connection string
    echo    - JWT_SECRET: Generate a strong 32+ character secret
    echo    - FRONTEND_URL: Your frontend domain
    echo.
    echo    Example:
    echo    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true^&w=majority
    echo    JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
    echo    FRONTEND_URL=https://your-frontend-domain.com
    echo.
    echo    Press any key to continue after updating...
    pause >nul
)

REM Check if JWT secret is properly configured
findstr /C:"JWT_SECRET=" "backend\.env >nul
if %errorlevel% neq 0 (
    echo ❌ JWT_SECRET not found in backend\.env
    echo Please update backend\.env and try again
    echo.
    echo Current backend\.env content:
    type backend\.env
    echo.
    pause
    exit /b 1
)

REM Check MongoDB URI
findstr /C:"MONGODB_URI=" "backend\.env >nul
if %errorlevel% neq 0 (
    echo ❌ MONGODB_URI not found in backend\.env
    echo Please update backend\.env and try again
    echo.
    echo Current backend\.env content:
    type backend\.env
    echo.
    pause
    exit /b 1
)

echo ✅ Environment variables validated
echo.
echo 📋 Render Deployment Steps:
echo 1. Go to https://render.com
echo 2. Sign up/login
echo 3. Click "New Web Service"
echo 4. Connect your GitHub repository
echo 5. Configure deployment:
echo    - Name: spendwise-backend
echo    - Root Directory: backend
echo    - Build Command: npm install
echo    - Start Command: npm run start:prod
echo    - Instance Type: Free
echo 6. Add environment variables in Render dashboard:
echo    - PORT=5000
echo    - NODE_ENV=production
echo    - MONGODB_URI=your-mongodb-connection-string
echo    - JWT_SECRET=your-32-character-secret
echo    - JWT_EXPIRE=7d
echo    - FRONTEND_URL=https://your-frontend-domain.com
echo.
echo 📋 Your backend will be available at:
echo    https://spendwise-backend.onrender.com
echo.
echo 🎉 Ready for Render deployment!
echo.
echo 📋 Next Steps:
echo    1. Go to https://render.com
echo    2. Create new web service
echo    3. Connect your GitHub repository
echo    4. Configure deployment settings
echo    5. Add environment variables
echo    6. Deploy!
echo.
echo 📖 See RENDER_DEPLOYMENT.md for detailed instructions

pause
