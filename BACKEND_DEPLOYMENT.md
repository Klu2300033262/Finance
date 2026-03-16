# 🚀 Backend Deployment Guide - Separate Deployment

## 📋 Backend Deployment Options

### Option 1: Railway (Recommended - Easy & Free)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for backend deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Set environment variables:
     ```
     PORT=5000
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority
     JWT_SECRET=your-32-character-random-secret-key-here
     JWT_EXPIRE=7d
     FRONTEND_URL=https://your-frontend-domain.com
     ```

3. **Auto-Deploy**
   - Railway automatically builds and deploys on push
   - Provides public URL immediately

### Option 2: Render (Free Tier Available)
1. **Prepare for Deployment**
   ```bash
   git add .
   git commit -m "Ready for backend deployment"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect GitHub repository
   - Set build command: `npm start`
   - Set start command: `npm run start:prod`
   - Add environment variables

3. **Environment Variables**
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority
   JWT_SECRET=your-32-character-random-secret-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Option 3: DigitalOcean VPS (Full Control)
1. **Create Droplet**
   - Choose Ubuntu 22.04
   - Select appropriate size ($6-20/month recommended)
   - Add SSH key

2. **Setup Server**
   ```bash
   # SSH into your server
   ssh root@your-server-ip

   # Update system
   apt update && apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs

   # Install PM2
   npm install -g pm2

   # Clone your repository
   git clone https://github.com/your-username/your-repo.git
   cd your-repo

   # Install dependencies
   npm run install:all

   # Set environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values

   # Build and start
   npm run build
   cd backend
   pm2 start server.js --name "spendwise-backend"
   pm2 save
   pm2 startup
   ```

### Option 4: Heroku (Easy to Start)
1. **Prepare for Deployment**
   ```bash
   # Create Procfile
   echo "web: cd backend && npm start" > Procfile
   echo "node backend/server.js" > package.json scripts.heroku-postbuild
   ```

2. **Deploy**
   ```bash
   # Install Heroku CLI
   npm install -g heroku

   # Login
   heroku login

   # Create app
   heroku create your-app-name

   # Set environment variables
   heroku config:set PORT=5000
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority
   heroku config:set JWT_SECRET=your-32-character-random-secret-key-here
   heroku config:set JWT_EXPIRE=7d
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com

   # Deploy
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 5: AWS EC2 (Enterprise)
1. **Create EC2 Instance**
   - Choose Ubuntu 22.04
   - Select t3.micro or t3.small
   - Configure security group (port 5000)
   - Add elastic IP

2. **Setup Server**
   ```bash
   # SSH into EC2
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Update and install
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs nginx

   # Clone and setup
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   npm run install:all

   # Configure nginx
   sudo nano /etc/nginx/sites-available/spendwise
   # Configure reverse proxy to port 5000

   # Enable site
   sudo ln -s /etc/nginx/sites-available/spendwise /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

   # Install PM2 and start app
   npm install -g pm2
   cd backend
   pm2 start server.js --name "spendwise-backend"
   pm2 save
   pm2 startup
   ```

## 🔧 Backend Configuration

### Environment Variables (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-32-character-random-secret-key-here-minimum-32-characters
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

### Production Server Configuration
- ✅ Port 5000 (consistent)
- ✅ Production mode enabled
- ✅ Security headers (Helmet)
- ✅ Rate limiting (100 requests/15min)
- ✅ CORS configured for your domain

## 🚀 Quick Backend Deployment

### Using Railway (Recommended)
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up

# 4. Set environment variables in Railway dashboard
```

### Using Render
```bash
# 1. Install Render CLI (optional)
npm i -g render

# 2. Deploy (or use web dashboard)
render login
render deploy
```

### Using PM2 (VPS)
```bash
# 1. Install PM2
npm install -g pm2

# 2. Start production server
cd backend
pm2 start server.js --name "spendwise-backend"

# 3. Save PM2 configuration
pm2 save

# 4. Setup auto-start
pm2 startup
```

## 📊 Backend Monitoring

### PM2 Monitoring
```bash
# View running processes
pm2 list

# View logs
pm2 logs spendwise-backend

# Monitor performance
pm2 monit

# Restart if needed
pm2 restart spendwise-backend
```

### Health Check Endpoint
- **URL**: `/api/health`
- **Response**: Server status and environment
- **Usage**: Monitor server health

### Log Management
```bash
# View application logs
pm2 logs spendwise-backend

# View error logs
pm2 logs spendwise-backend --err

# Clear logs
pm2 flush
```

## 🔍 Backend Testing After Deployment

### Critical Tests
1. **Health Check**: `https://your-backend-domain.com/api/health`
2. **User Registration**: Test API endpoint
3. **User Login**: Test JWT authentication
4. **CRUD Operations**: Test all API endpoints
5. **Database Connection**: Verify MongoDB connectivity

### API Testing Commands
```bash
# Health check
curl https://your-backend-domain.com/api/health

# User registration
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# User login
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🛡️ Backend Security

### Production Security Measures
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Helmet.js**: Security headers
- ✅ **Rate Limiting**: Prevents abuse (100 req/15min)
- ✅ **CORS**: Configured for your domain only
- ✅ **Input Validation**: Sanitizes all inputs
- ✅ **Password Hashing**: bcrypt with salt rounds

### Security Headers
```javascript
// Already implemented
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

## 🔄 CI/CD for Backend

### GitHub Actions Example
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**', 'package.json']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - with:
        node-version: '18'
      - run: npm ci
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-key: ${{ secrets.RAILWAY_TOKEN }}
          service-id: ${{ secrets.RAILWAY_SERVICE_ID }}
```

## 📱 Backend URLs After Deployment

### Railway
- **Preview**: `https://your-app-name.up.railway.app`
- **Custom**: `https://your-domain.railway.app`

### Render
- **Preview**: `https://your-app-name.onrender.com`
- **Custom**: `https://your-app-name.render.com`

### DigitalOcean
- **IP Address**: `http://your-server-ip`
- **Domain**: Configure with nginx/Apache

### Heroku
- **Preview**: `https://your-app-name.herokuapp.com`
- **Custom**: Configure with custom domain

### AWS EC2
- **IP Address**: `http://your-elastic-ip`
- **Domain**: Configure with Route 53

## 🎯 Backend Deployment Success Indicators

### ✅ Success When:
- [ ] Server responds at your domain
- [ ] Health check returns 200 OK
- [ ] MongoDB connection established
- [ ] User registration/login works
- [ ] All API endpoints respond correctly
- [ ] JWT authentication works
- [ ] CORS allows your frontend domain
- [ ] No critical errors in logs
- [ ] Server stays running 24/7

### 📊 Performance Metrics:
- **Response Time**: < 200ms (ideal)
- **Uptime**: 99.9%+ (with PM2)
- **Memory Usage**: < 512MB (small apps)
- **CPU Usage**: < 25% (small apps)

## 🚀 Backend Deployment Checklist

### Pre-Deployment:
- [ ] Environment variables configured in `.env`
- [ ] MongoDB connection string working
- [ ] JWT secret is strong (32+ chars)
- [ ] PORT set to 5000
- [ ] FRONTEND_URL set to your domain
- [ ] Build runs without errors
- [ ] All dependencies installed

### Post-Deployment:
- [ ] Server accessible via domain
- [ ] HTTPS/SSL enabled
- [ ] Database connection verified
- [ ] All API endpoints tested
- [ ] Authentication working
- [ ] Monitoring configured
- [ ] Auto-restart setup (PM2)
- [ ] Logs accessible

---

**🚀 Your backend is now ready for separate deployment with any hosting service!**
