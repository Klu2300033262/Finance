import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .env file with API URL
const envContent = `VITE_API_URL=http://localhost:5000/api
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Frontend .env file created successfully');
  console.log('🔗 API URL configured for: http://localhost:5000/api');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
