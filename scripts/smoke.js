#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Routes to test
const routes = [
  '/',
  '/camera',
  '/achievements',
  '/profile',
  '/game',
  '/review',
  '/recycler',
  '/recycler/users',
  '/recycler/camera',
  '/vouchers'
];

// Landmark elements to check for
const landmarkElements = {
  '/': 'body', // Basic page load
  '/camera': 'button', // Camera button
  '/achievements': 'div', // Achievements container
  '/profile': 'div', // Profile container
  '/game': 'div', // Game container
  '/review': 'div', // Review container
  '/recycler': 'div', // Recycler container
  '/recycler/users': 'div', // Users container
  '/recycler/camera': 'div', // Camera container
  '/vouchers': 'div' // Vouchers container
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https://') ? https : http;

    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          url: url
        });
      });
    });

    req.on('error', (err) => {
      reject({
        error: err.message,
        url: url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        url: url
      });
    });
  });
}

async function runSmokeTest() {
  console.log('🚀 Starting EcoGo! smoke test...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    const landmark = landmarkElements[route];

    try {
      console.log(`Testing ${route}...`);
      const result = await makeRequest(url);

      if (result.status === 200) {
        // Check for landmark element (basic HTML structure check)
        const hasLandmark = result.data.includes('<html') && result.data.includes('<body');

        if (hasLandmark) {
          console.log(`  ✅ ${route} - Status: ${result.status}, Landmark: Found`);
          passed++;
        } else {
          console.log(`  ⚠️  ${route} - Status: ${result.status}, Landmark: Missing`);
          failed++;
        }
      } else {
        console.log(`  ❌ ${route} - Status: ${result.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ ${route} - Error: ${error.error || error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('📊 Smoke Test Results:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('');
    console.log('❌ Smoke test failed!');
    process.exit(1);
  } else {
    console.log('');
    console.log('🎉 All smoke tests passed!');
    process.exit(0);
  }
}

// Run the test
runSmokeTest().catch((error) => {
  console.error('💥 Smoke test error:', error);
  process.exit(1);
});
