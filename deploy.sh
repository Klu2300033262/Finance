#!/bin/bash

# 🚀 SpendWise MERN App - Production Deployment Script

echo "🚀 Starting SpendWise MERN App Deployment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_NODE="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
    echo "✅ Node.js version $NODE_VERSION is compatible"
else
    echo "❌ Node.js version $NODE_VERSION is incompatible. Required: >= $REQUIRED_NODE"
    exit 1
fi

# Check if MongoDB URI is set
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found. Please create it with your MongoDB configuration."
    exit 1
fi

if ! grep -q "MONGODB_URI=" backend/.env; then
    echo "❌ MONGODB_URI not found in backend/.env"
    exit 1
fi

# Check if JWT secret is set
if ! grep -q "JWT_SECRET=" backend/.env; then
    echo "❌ JWT_SECRET not found in backend/.env"
    exit 1
fi

# Check if JWT secret is too short
JWT_SECRET=$(grep "JWT_SECRET=" backend/.env | cut -d'=' -f2)
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ JWT_SECRET must be at least 32 characters long"
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ..

# Build frontend
echo "🏗️ Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Test backend
echo "🧪 Testing backend configuration..."
cd backend && npm run start:prod &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test health endpoint
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend health check passed"
    kill $BACKEND_PID
else
    echo "❌ Backend health check failed"
    kill $BACKEND_PID
    exit 1
fi

cd ..

echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set your production domain in .env.production"
echo "2. Deploy frontend to your hosting service (Vercel, Netlify, etc.)"
echo "3. Deploy backend to your server (VPS, Railway, Render, etc.)"
echo "4. Update environment variables with your domain"
echo "5. Test your deployed application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
