# 🟨 Render Deployment Script

echo "🚀 Deploying SpendWise Backend to Render..."

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found."
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Update backend/.env with your actual values:"
    echo "   - MONGODB_URI: Your MongoDB connection string"
    echo "   - JWT_SECRET: Generate a strong 32+ character secret"
    echo "   - FRONTEND_URL: Your frontend domain"
    echo ""
    echo "   Example:"
    echo "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority"
    echo "   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters"
    echo "   FRONTEND_URL=https://your-frontend-domain.com"
    echo ""
    echo "   Press any key to continue after updating..."
    read -p ""
fi

# Check if JWT secret is properly configured
JWT_SECRET=$(grep "JWT_SECRET=" backend/.env | cut -d'=' -f2)
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ JWT_SECRET must be at least 32 characters long for security"
    echo "Current length: ${#JWT_SECRET}"
    echo "Please update backend/.env and try again"
    exit 1
fi

# Check MongoDB URI
if ! grep -q "MONGODB_URI=" backend/.env; then
    echo "❌ MONGODB_URI not found in backend/.env"
    echo "Please update backend/.env and try again"
    exit 1
fi

echo "✅ Environment variables validated"
echo ""
echo "📋 Render Deployment Options:"
echo "1. Web Dashboard (Recommended)"
echo "2. GitHub Integration"
echo ""
echo "🌐 Recommended: Use Render Web Dashboard"
echo "   1. Go to https://render.com"
echo "   2. Sign up/login"
echo "   3. Click 'New Web Service'"
echo "   4. Connect your GitHub repository"
echo "   5. Configure deployment:"
echo "      - Name: spendwise-backend"
echo "      - Root Directory: backend"
echo "      - Build Command: npm install"
echo "      - Start Command: npm run start:prod"
echo "      - Instance Type: Free"
echo "   6. Add environment variables in Render dashboard:"
echo "      - PORT=5000"
echo "      - NODE_ENV=production"
echo "      - MONGODB_URI=your-mongodb-connection-string"
echo "      - JWT_SECRET=your-32-character-secret"
echo "      - JWT_EXPIRE=7d"
echo "      - FRONTEND_URL=https://your-frontend-domain.com"
echo ""
echo "� Your backend will be available at:"
echo "   https://spendwise-backend.onrender.com"
echo ""
echo "🎉 Ready for Render deployment!"
