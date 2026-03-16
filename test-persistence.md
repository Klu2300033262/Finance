# Testing Persistent Login Functionality

## How to Test:

1. **Open the App**: Go to http://localhost:5174

2. **Create Account**: 
   - Click "Get Started" 
   - Enter any email/password (e.g., test@example.com / password123)
   - You'll be automatically logged in

3. **Verify Session Info**:
   - Look for the blue session info box showing your email
   - Note the "Session expires in X days" message

4. **Test Persistence**:
   - **Method 1**: Close the browser tab and reopen http://localhost:5174
   - **Method 2**: Refresh the page (F5 or Ctrl+R)
   - **Method 3**: Close the entire browser and reopen

5. **Expected Result**: 
   - You should still be logged in
   - Dashboard should load with your data
   - Session info should still show

6. **Test Session Expiration**:
   - Session expires after 7 days
   - After expiration, you'll need to log in again

## Technical Details:

- **Storage**: localStorage with key 'auth_session'
- **Duration**: 7 days from last login
- **Auto-cleanup**: Expired sessions are automatically removed
- **Security**: Basic token-based authentication (demo purposes)

## Data Persistence:

All financial data (transactions, budgets, analytics) is also stored in localStorage and persists across sessions.
