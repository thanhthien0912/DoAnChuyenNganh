# Debug: Transaction History Loading Issue

## Problem
Cannot load transaction history at http://localhost:3001/student/transactions

## Root Causes & Solutions

### 1. Authentication Issue (Most Common)
**Symptom**: "Không thể tải lịch sử giao dịch" error
**Cause**: No valid JWT token or token expired

**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab and check for errors
3. Look for 401 (Unauthorized) or 403 (Forbidden) status codes
4. Check Application → Local Storage → http://localhost:3001
5. Verify `accessToken` exists and is not expired

**Fix**:
- If no token: Log in again at http://localhost:3001/login
- If token expired: Log out and log in again
- Check if token refresh is working in the API service

### 2. API Response Format Issue
**Current API Response Structure**:
```javascript
{
  success: true,
  data: {
    transactions: [...],
    pagination: {...},
    stats: {...}
  }
}
```

**Frontend expects**: `response.data.data.transactions`
This is correct ✓

### 3. Backend Not Running
**Check if backend is running**:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Or check server logs
cd backend
npm run dev
```

### 4. Database Connection Issue
**Check MongoDB**:
```bash
# Check if MongoDB is running
net start MongoDB
# or
mongod --version
```

### 5. CORS Issue
**Verify** `.env` has:
```
CORS_ORIGIN=http://localhost:3001
```

## Debugging Steps

### Step 1: Check Browser Console
1. Open http://localhost:3001/student/transactions
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for error messages

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Refresh the page
3. Look for the request to `/api/transactions/history`
4. Check:
   - Status code (should be 200)
   - Request headers (should have Authorization: Bearer ...)
   - Response data

### Step 3: Test API Directly
```bash
# Get your access token from localStorage
# Then test with curl (in Git Bash or WSL):
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/transactions/history
```

### Step 4: Check Backend Logs
Look at the terminal where backend is running for error messages.

## Quick Fixes

### Fix 1: Clear Storage and Re-login
```javascript
// Open browser console and run:
localStorage.clear();
// Then go to http://localhost:3001/login
```

### Fix 2: Check Token Refresh
The frontend has automatic token refresh. Check if it's working:
1. Look for `/api/auth/refresh-token` requests in Network tab
2. If failing, clear localStorage and log in again

### Fix 3: Add Debug Logging
Add this to `frontend/src/pages/student/TransactionHistory.jsx`:

```javascript
const loadTransactions = useCallback(async () => {
  try {
    setLoading(true)
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      ...filters,
    }

    console.log('Loading transactions with params:', params)
    const response = await transactionAPI.getTransactionHistory(params)
    console.log('Transaction response:', response.data)
    
    setTransactions(response.data.data.transactions)
    setPagination(response.data.data.pagination || { total: response.data.data.transactions?.length || 0, pages: 1 })
  } catch (error) {
    console.error('Transaction loading error:', error.response || error)
    showSnackbar('Không thể tải lịch sử giao dịch', 'error')
  } finally {
    setLoading(false)
  }
}, [filters, page, rowsPerPage, showSnackbar])
```

## Expected Behavior
- User must be logged in
- Backend must be running on port 3000
- Frontend must be running on port 3001
- MongoDB must be running
- Valid JWT token must be in localStorage

## Contact Points
- Backend API: http://localhost:3000/api/transactions/history
- Frontend route: http://localhost:3001/student/transactions
- Proxy: Vite proxies /api → http://localhost:3000
