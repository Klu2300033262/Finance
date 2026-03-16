import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .env file with MongoDB credentials
const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://manoj:manoj@cluster0.3oml5i1.mongodb.net/?appName=Cluster0

# JWT Configuration
JWT_SECRET=spendwise-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5174
`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in backend directory');
  console.log('📄 MongoDB URI configured with your credentials');
  console.log('🚀 You can now start the server with: npm run dev:full');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('📝 Please manually create backend/.env with the following content:');
  console.log(envContent);
}
