const http = require('http');

const BACKEND_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

const endpoints = [
  // Backend Core
  { url: '/api/v1/content', host: BACKEND_URL },
  { url: '/api/v1/content/categories', host: BACKEND_URL },
  { url: '/api/v1/content/tags', host: BACKEND_URL },
  { url: '/api/v1/content/stats', host: BACKEND_URL },
  { url: '/api/v1/content/recent', host: BACKEND_URL },
  
  // Frontend Routes
  { url: '/', host: FRONTEND_URL },
  { url: '/research', host: FRONTEND_URL },
  { url: '/publications', host: FRONTEND_URL },
  { url: '/contact', host: FRONTEND_URL },
  { url: '/admin', host: BACKEND_URL }
];

async function checkEndpoint(item) {
  return new Promise((resolve) => {
    http.get(item.host + item.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url: item.host + item.url,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
          preview: data.substring(0, 100).replace(/\n/g, ' ')
        });
      });
    }).on('error', (err) => {
      resolve({
        url: item.host + item.url,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE DEBUG SUITE ---');
  let allSuccess = true;
  for (const ep of endpoints) {
    const result = await checkEndpoint(ep);
    console.log(`[${result.success ? 'PASS' : 'FAIL'}] ${result.status} ${result.url}`);
    if (!result.success) {
      allSuccess = false;
      if (result.error) console.log(`   Error: ${result.error}`);
      else console.log(`   Response Preview: ${result.preview}`);
    }
  }
  console.log('------------------------------------------');
  console.log(allSuccess ? '✅ All basic endpoints are reachable.' : '❌ Some endpoints failed.');
}

runTests();
