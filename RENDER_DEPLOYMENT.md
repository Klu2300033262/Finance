# 🟨 Render Backend Deployment Guide

## 🚀 Step-by-Step Render Deployment

### 1. **Prepare Your Repository**
```bash
# Make sure your code is committed to GitHub
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. **Set Up Environment Variables**
Create `backend/.env`:
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. **Deploy to Render**

#### Option A: Using Render Web Dashboard (Recommended)
1. **Go to [render.com](https://render.com)**
2. **Sign up** or **Login**
3. **Click "New Web Service"**
4. **Connect GitHub repository**
5. **Select your repository**
6. **Configure deployment:**
   - **Name**: `spendwise-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free`
   - **Region**: Choose nearest region

#### Option B: Using Render CLI
```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Deploy
cd backend
npm run deploy:render
```

### 4. **Set Environment Variables in Render**
In Render dashboard, add these environment variables:
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
```

### 5. **Configure Health Check**
- **Health Check Path**: `/api/health`
- **Health Check Timeout**: `30000ms`
- **Auto-Deploy**: `Enabled`

### 6. **Deploy and Test**
1. **Click "Create Web Service"**
2. **Wait for deployment** (2-3 minutes)
3. **Test the API**: `https://your-app.onrender.com/api/health`

## 📋 Render Configuration Details

### Service Configuration
- **Type**: Web Service
- **Plan**: Free (includes 750 hours/month)
- **Instance**: Free tier
- **Auto-Deploy**: Enabled
- **Health Check**: `/api/health`

### Environment Variables
```bash
PORT=5000                    # Server port
NODE_ENV=production          # Production mode
MONGODB_URI=...              # MongoDB connection
JWT_SECRET=...               # JWT secret (32+ chars)
JWT_EXPIRE=7d                # Token expiration
FRONTEND_URL=...            # Frontend domain for CORS
```

### Build Configuration
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm run start:prod`

## 🔧 Render-Specific Optimizations

### 1. **Health Check Endpoint**
Already implemented in your backend:
```javascript
// GET /api/health
{
  "status": "OK",
  "timestamp": "2024-03-16T...",
  "environment": "production"
}
```

### 2. **Render Environment Variables**
Render automatically sets:
- `PORT` (use `process.env.PORT`)
- `NODE_ENV` (set to production)
- `HOST` (Render's internal host)

### 3. **Database Connection**
Ensure MongoDB Atlas allows Render's IP ranges:
- Add Render's IP to MongoDB Atlas whitelist
- Use connection string with `retryWrites=true`

## 🚀 Quick Deploy Commands

### Using Render CLI
```bash
# Install CLI
npm install -g @render/cli

# Login
render login

# Deploy
cd backend
npm run deploy:render
```

### Using Web Interface
1. Go to render.com
2. Connect GitHub repository
3. Configure service
4. Deploy automatically

## 📊 Render Features (Free Tier)

### What You Get:
- ✅ **750 hours/month** of compute time
- ✅ **Auto-deploy** from GitHub
- ✅ **SSL/HTTPS** automatically
- ✅ **Custom domain** support
- ✅ **Health checks**
- ✅ **Logs and metrics**
- ✅ **Automatic restarts**

### Limitations:
- ⚠️ **Sleeps after 15 minutes** of inactivity
- ⚠️ **Cold starts** (30-60 seconds)
- ⚠️ **Limited to 1 instance**
- ⚠️ **No custom domains on free tier**

## 🔍 Testing After Deployment

### Critical Tests:
```bash
# Health check
curl https://your-app.onrender.com/api/health

# User registration
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# User login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Browser Testing:
1. **Open your app URL**: `https://your-app.onrender.com`
2. **Test registration/login**
3. **Add income/expenses**
4. **Create budgets**
5. **View dashboard**

## 🔄 CI/CD with Render

### GitHub Actions Integration
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Render Deploy
        run: |
          curl -X POST https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

## 🎯 Success Indicators

### ✅ Deployment Success When:
- [ ] Service status shows "Live"
- [ ] Health check returns 200 OK
- [ ] API endpoints respond correctly
- [ ] MongoDB connection established
- [ ] User authentication works
- [ ] No critical errors in logs
- [ ] Auto-deploy enabled

### 📊 Expected Performance:
- **Cold Start**: 30-60 seconds (free tier)
- **Response Time**: 200-500ms (warm)
- **Uptime**: 99%+ (with auto-restart)
- **Memory**: 512MB (free tier)

## 🛠️ Troubleshooting

### Common Issues:

#### 1. **MongoDB Connection Failed**
```bash
# Check MongoDB Atlas IP whitelist
# Add Render's IP ranges to MongoDB Atlas
# Connection string should include retryWrites=true
```

#### 2. **Health Check Failed**
```bash
# Check server logs in Render dashboard
# Ensure PORT environment variable is set to 5000
# Verify server.js is in backend directory
```

#### 3. **JWT Secret Error**
```bash
# Ensure JWT_SECRET is at least 32 characters
# Check environment variables in Render dashboard
# Restart service after updating variables
```

#### 4. **CORS Issues**
```bash
# Ensure FRONTEND_URL matches your actual frontend domain
# Check CORS configuration in backend/server.js
# Verify domain includes protocol (https://)
```

## 📱 Your Render Backend URL

After deployment, your backend will be available at:
```
https://spendwise-backend.onrender.com
```

**🎉 Your backend is now deployed on Render and ready for frontend integration!**

## 🔄 Next Steps

1. **Note your backend URL** from Render
2. **Update frontend .env.production** with your backend URL
3. **Deploy frontend separately** to Vercel/Netlify
4. **Test full application** integration
5. **Monitor performance** in Render dashboard

---

**🚀 Your SpendWise backend is now running on Render!**
