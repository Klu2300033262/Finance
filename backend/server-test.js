import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Configure environment
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Backend server is running without MongoDB connection'
  });
});

// Test auth endpoint
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: req.body
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
  console.log(`⚠️  MongoDB connection disabled for testing`);
});

export default app;
