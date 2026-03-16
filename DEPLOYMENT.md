# 🚀 SpendWise MERN App - Deployment Guide

## 📋 Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB database (MongoDB Atlas recommended)
- Domain name (for production)

## 🔧 Environment Setup

### 1. Backend Environment Variables
Create `backend/.env`:
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=https://your-domain.com
```

### 2. Frontend Environment Variables
Create `.env.production`:
```bash
VITE_API_URL=https://your-domain.com/api
```

## 🏗️ Build Process

### Local Build Test
```bash
# Install all dependencies
npm run install:all

# Build frontend
npm run build:prod

# Test production build locally
npm run start:prod
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend)
1. Push code to GitHub
2. Connect Vercel to your repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Netlify
1. Build frontend: `npm run build`
2. Upload `dist` folder to Netlify
3. Set environment variables
4. Deploy

### Option 3: VPS/DigitalOcean
1. Clone repository to server
2. Install dependencies: `npm run install:all`
3. Set environment variables
4. Build frontend: `npm run build`
5. Start production: `npm run start:prod`

### Option 4: Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploy on push

## 🔍 Pre-Deployment Checklist

### ✅ Frontend
- [ ] Environment variables set
- [ ] Build runs without errors: `npm run build`
- [ ] API URL points to production backend
- [ ] No hardcoded localhost URLs
- [ ] All pages load correctly

### ✅ Backend
- [ ] Environment variables set
- [ ] MongoDB connection working
- [ ] JWT secret is strong (32+ chars)
- [ ] CORS configured for production domain
- [ ] All API endpoints tested

### ✅ Database
- [ ] MongoDB Atlas cluster created
- [ ] Network access configured
- [ ] Connection string working
- [ ] Indexes created for performance

## 🚀 Deployment Commands

### Build & Deploy
```bash
# Build frontend
npm run build

# Start backend in production
cd backend && npm run start:prod
```

### PM2 Process Management (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd backend && pm2 start server.js --name "spendwise-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## 🔒 Security Considerations

### Critical Security Settings
1. **JWT Secret**: Use a strong, random 32+ character string
2. **MongoDB**: Use IP whitelisting and strong passwords
3. **HTTPS**: Enable SSL/TLS in production
4. **Environment Variables**: Never commit `.env` files
5. **Rate Limiting**: Already configured (100 requests/15min)
6. **Helmet**: Security headers already configured

### Recommended Security Headers
```javascript
// Already implemented in backend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## 📊 Monitoring & Logging

### Production Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs spendwise-backend

# Restart if needed
pm2 restart spendwise-backend
```

### Health Check Endpoint
- URL: `/api/health`
- Returns server status and environment info

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. CORS Errors
- Check `FRONTEND_URL` in backend `.env`
- Ensure domain matches exactly (no trailing slash)

#### 2. MongoDB Connection
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

#### 3. Build Failures
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run typecheck`
- Verify all imports are correct

#### 4. JWT Issues
- Clear browser localStorage
- Regenerate JWT secret
- Check token expiration

## 📱 Post-Deployment Testing

### Critical Tests
1. **User Registration/Login**
2. **Add Income/Expenses**
3. **Create Budgets**
4. **View Dashboard**
5. **Analytics Page**
6. **API Health Check**

### URL Testing
```bash
# Test API health
curl https://your-domain.com/api/health

# Test user registration
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 📝 Environment Variables Template

### Production `.env` (Backend)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-32-character-random-secret-key-here
JWT_EXPIRE=7d
FRONTEND_URL=https://your-domain.com
```

### Production `.env.production` (Frontend)
```env
VITE_API_URL=https://your-domain.com/api
```

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Frontend loads at your domain
- ✅ API endpoints respond correctly
- ✅ Users can register and login
- ✅ Data persists in MongoDB
- ✅ All features work as expected
- ✅ No console errors in browser
- ✅ Server logs show no critical errors

## 🆘 Support

For deployment issues:
1. Check server logs: `pm2 logs`
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB connection
5. Review CORS configuration

---

**🚀 Your SpendWise MERN application is now ready for production deployment!**
