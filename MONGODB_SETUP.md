# MongoDB Setup Instructions

## Step 1: Create your .env file

Create a file named `.env` in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.3oml5i1.mongodb.net/?appName=Cluster0

# JWT Configuration
JWT_SECRET=spendwise-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5174
```

## Step 2: Replace placeholders

Replace `<db_username>` and `<db_password>` with your actual MongoDB credentials.

## Step 3: Start the application

Once you've created the .env file, run:

```bash
npm run dev:full
```

This will start both the backend (port 5000) and frontend (port 5174) servers.

## Step 4: Test the connection

Visit http://localhost:5000/api/health to verify the backend is connected to MongoDB.
