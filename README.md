# SpendWise Finance Analytics - MERN Stack

A comprehensive personal finance management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with registration and login
- **Transaction Management**: Track income and expenses with categories and tags
- **Budget Planning**: Set and monitor budgets with alerts
- **Recurring Transactions**: Manage recurring payments and subscriptions
- **Advanced Analytics**: Visualize financial data with charts and insights
- **Real-time Dashboard**: Overview of financial health with KPIs
- **Responsive Design**: Modern UI with TailwindCSS and Framer Motion

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB database (MongoDB Atlas recommended)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd spendwise-mern-app
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup

#### Backend Environment
Create `backend/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendwise?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5174
```

#### Frontend Environment
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers

#### Option 1: Run Both Frontend and Backend
```bash
npm run dev:full
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
spendwise-mern-app/
├── backend/                 # Express.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts
│   ├── lib/               # Utility functions and API service
│   ├── pages/             # Page components
│   └── main.tsx           # App entry point
├── public/                # Static assets
├── package.json           # Frontend dependencies and scripts
└── README.md             # This file
```

## 🔧 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

### Backend Scripts
- `npm run dev` - Start backend in development mode
- `npm start` - Start backend in production mode
- `npm run build` - Build (no-op for Node.js)

### Combined Scripts
- `npm run install:all` - Install all dependencies
- `npm run dev:full` - Run both frontend and backend
- `npm run start:prod` - Build and start production server

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - User logout

### Transaction Endpoints
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Endpoints
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/summary` - Get financial summary
- `GET /api/analytics/trends` - Get spending trends

## 🚀 Deployment

### Environment Variables for Production

#### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=your-production-frontend-url
```

#### Frontend (.env)
```env
VITE_API_URL=your-production-api-url
```

### Deployment Steps

1. **Build Frontend**
```bash
npm run build
```

2. **Deploy Backend**
- Upload backend files to your server
- Install dependencies: `npm install --production`
- Set environment variables
- Start server: `npm start`

3. **Deploy Frontend**
- Upload the `dist` folder to your hosting service
- Configure routing for SPA (all routes to index.html)

### Recommended Deployment Platforms

#### Backend
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Vercel (serverless)

#### Frontend
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🔒 Security Features

- JWT-based authentication with expiration
- Password hashing with bcryptjs
- CORS configuration
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation and sanitization
- MongoDB injection protection with Mongoose

## 🧪 Testing

The application includes comprehensive error handling and validation. For production deployment, consider adding:

- Unit tests with Jest
- Integration tests
- E2E tests with Cypress
- API testing with Postman/Newman

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using the MERN stack**
