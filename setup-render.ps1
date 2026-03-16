# 🟨 Render Backend Setup - PowerShell Version

Write-Host "🚀 Setting up SpendWise Backend for Render deployment..."

# Check if backend .env exists
$envPath = "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ backend\.env file not found."
    Write-Host "Creating backend\.env from template..."
    Copy-Item "backend\.env.example" $envPath -Force
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update backend\.env with your actual values:"
    Write-Host "   - MONGODB_URI: Your MongoDB connection string"
    Write-Host "   - JWT_SECRET: Generate a strong 32+ character secret"
    Write-Host "   - FRONTEND_URL: Your frontend domain"
    Write-Host ""
    Write-Host "   Example:"
    Write-Host "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority"
    Write-Host "   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters"
    Write-Host "   FRONTEND_URL=https://your-frontend-domain.com"
    Write-Host ""
    Write-Host "   Please update the file and run this script again."
    exit 1
}

# Read and validate .env file
$envContent = Get-Content $envPath
$jwtSecret = ($envContent | Select-String "JWT_SECRET=").ToString().Split('=')[1]
$mongoUri = ($envContent | Select-String "MONGODB_URI=").ToString().Split('=')[1]

if ($jwtSecret.Length -lt 32) {
    Write-Host "❌ JWT_SECRET must be at least 32 characters long for security"
    Write-Host "Current length: $($jwtSecret.Length)"
    Write-Host "Please update backend\.env and try again"
    exit 1
}

if (-not ($mongoUri -match "mongodb")) {
    Write-Host "❌ Invalid MONGODB_URI found in backend\.env"
    Write-Host "Please update backend\.env with your MongoDB connection string"
    exit 1
}

Write-Host "✅ Environment variables validated"
Write-Host ""
Write-Host "📋 Render Deployment Steps:"
Write-Host "1. Go to https://render.com"
Write-Host "2. Sign up/login"
Write-Host "3. Click 'New Web Service'"
Write-Host "4. Connect your GitHub repository"
Write-Host "5. Configure deployment:"
Write-Host "   - Name: spendwise-backend"
Write-Host "   - Root Directory: backend"
Write-Host "   - Build Command: npm install"
Write-Host "   - Start Command: npm run start:prod"
Write-Host "   - Instance Type: Free"
Write-Host "6. Add environment variables in Render dashboard:"
Write-Host "   - PORT=5000"
Write-Host "   - NODE_ENV=production"
Write-Host "   - MONGODB_URI=your-mongodb-connection-string"
Write-Host "   - JWT_SECRET=your-32-character-secret"
Write-Host "   - JWT_EXPIRE=7d"
Write-Host "   - FRONTEND_URL=https://your-frontend-domain.com"
Write-Host ""
Write-Host "📋 Your backend will be available at:"
Write-Host "   https://spendwise-backend.onrender.com"
Write-Host ""
Write-Host "🎉 Ready for Render deployment!"
Write-Host ""
Write-Host "📋 Next Steps:"
Write-Host "1. Go to https://render.com"
Write-Host "2. Create new web service"
Write-Host "3. Connect your GitHub repository"
Write-Host "4. Configure deployment settings"
Write-Host "5. Add environment variables"
Write-Host "6. Deploy!"
Write-Host ""
Write-Host "📖 See RENDER_DEPLOYMENT.md for detailed instructions"
