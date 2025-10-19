// Quick API Test Script
// Run with: node test-api.js

const http = require('http');

console.log('Testing Student Wallet API endpoints...\n');

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve) => {
    console.log('1. Testing health check endpoint...');
    http.get('http://localhost:3000/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}\n`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`   Error: ${err.message}\n`);
      resolve();
    });
  });
}

// Test 2: Transaction History (without auth - should fail)
function testTransactionHistory() {
  return new Promise((resolve) => {
    console.log('2. Testing transaction history endpoint (no auth)...');
    http.get('http://localhost:3000/api/transactions/history', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}\n`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`   Error: ${err.message}\n`);
      resolve();
    });
  });
}

// Run tests
(async () => {
  await testHealthCheck();
  await testTransactionHistory();
  
  console.log('==========================================');
  console.log('Test Results:');
  console.log('==========================================');
  console.log('If health check returns 200: Backend is running ✓');
  console.log('If transaction history returns 401: Auth is required ✓');
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:3001 in your browser');
  console.log('2. Press F12 to open DevTools');
  console.log('3. Check Console tab for errors');
  console.log('4. Check Application → Local Storage for "accessToken"');
  console.log('5. If no token, log in at http://localhost:3001/login');
  console.log('==========================================');
})();
