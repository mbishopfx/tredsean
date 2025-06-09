// SMS Gateway Diagnostic Test Script for Sean
// Run this script on Sean's local network to test his SMS Gateway app

const http = require('http');

console.log('🔧 SMS Gateway Diagnostic Test for Sean');
console.log('📱 Phone: 13475522092');
console.log('🌐 Testing from local network...\n');

// Test configuration
const SEAN_CONFIG = {
  email: 'sean@trurankdigital.com',
  password: 'Croatia5376!',
  phone: '13475522092'
};

const TEST_MESSAGE = 'Test from Sean diagnostic script - ' + new Date().toLocaleTimeString();

// Function to test HTTP requests
function testEndpoint(options, postData = null) {
  return new Promise((resolve, reject) => {
    console.log(`🌐 Testing: http://${options.hostname}:${options.port}${options.path}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📥 Response: ${data}\n`);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}\n`);
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log('═'.repeat(60));
  console.log('🏠 TESTING LOCAL CONNECTIVITY (Sean should run this)');
  console.log('═'.repeat(60));
  
  // Test 1: Basic connectivity
  console.log('📍 Test 1: Basic connectivity to localhost:8080');
  try {
    const result = await testEndpoint({
      hostname: 'localhost',
      port: 8080,
      path: '/',
      method: 'GET'
    });
    console.log('✅ Basic connectivity: WORKING');
  } catch (error) {
    console.log('❌ Basic connectivity: FAILED');
    console.log('💡 SMS Gateway app may not be running or not on port 8080');
  }
  
  // Test 2: API endpoints
  const endpoints = ['/api/send', '/send', '/sms', '/api/v1/send', '/message'];
  
  for (const endpoint of endpoints) {
    console.log(`📍 Test 2.${endpoints.indexOf(endpoint) + 1}: ${endpoint}`);
    try {
      const result = await testEndpoint({
        hostname: 'localhost',
        port: 8080,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(SEAN_CONFIG.email + ':' + SEAN_CONFIG.password).toString('base64')}`
        }
      }, JSON.stringify({
        phone: '14176297373', // Your number for testing
        message: TEST_MESSAGE,
        to: '14176297373',
        text: TEST_MESSAGE
      }));
      
      if (result.status === 200) {
        console.log(`🎉 WORKING ENDPOINT FOUND: ${endpoint}`);
        break;
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Failed`);
    }
  }
  
  console.log('═'.repeat(60));
  console.log('🌐 EXTERNAL CONNECTIVITY TEST');
  console.log('═'.repeat(60));
  console.log('💡 If Sean\'s app is working locally but not externally:');
  console.log('   1. Check router port forwarding (8080 → phone IP)');
  console.log('   2. Check phone firewall/hotspot settings');
  console.log('   3. Ensure app allows external connections');
  console.log('   4. Verify public IP: 74.66.100.222');
}

// Get Sean's local IP for reference
console.log('🔍 Sean should also check his local IP address:');
console.log('   - On Android: Settings → About → Status → IP Address');
console.log('   - Or run: ifconfig (on terminal)');
console.log('   - Router should forward 74.66.100.222:8080 → [local_ip]:8080\n');

runDiagnostics().catch(console.error); 