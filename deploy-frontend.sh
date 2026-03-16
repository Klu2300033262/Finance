#!/bin/bash

# 🚀 Separate Frontend Deployment Script

echo "🌐 Deploying SpendWise Frontend separately..."

# Check if frontend build exists
if [ ! -d "dist" ]; then
    echo "🏗️ Building frontend first..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Frontend build failed"
        exit 1
    fi
fi

echo "✅ Frontend build completed successfully"

# Check environment variables
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "   Creating default .env.production..."
    echo "VITE_API_URL=https://your-backend-domain.com/api" > .env.production
    echo "   Please update with your actual backend domain"
fi

echo "📋 Frontend Deployment Options:"
echo "1. Vercel:     npm run deploy:vercel"
echo "2. Netlify:    npm run deploy:netlify"
echo "3. GitHub Pages: npm run deploy:gh-pages"
echo "4. Manual:     Upload dist/ folder to hosting service"

echo ""
echo "🚀 Choose deployment method:"
echo "   1) Vercel (Recommended)"
echo "   2) Netlify"
echo "   3) GitHub Pages"
echo "   4) Manual Upload"
echo ""
echo "   Example: npm run deploy:vercel"

read -p "Enter deployment option (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        npm run deploy:vercel
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        npm run deploy:netlify
        ;;
    3)
        echo "🚀 Deploying to GitHub Pages..."
        npm run deploy:gh-pages
        ;;
    4)
        echo "📁 Manual deployment"
        echo "   Upload the 'dist/' folder to your hosting service"
        echo "   Common options: Vercel, Netlify, AWS S3, GitHub Pages"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Frontend deployment completed!"
echo "📋 Don't forget to:"
echo "   1. Set VITE_API_URL to your backend domain"
echo "   2. Configure CORS on your backend"
echo "   3. Test all functionality"
echo "   4. Set up custom domain if needed"
