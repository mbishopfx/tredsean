const https = require('https');
const http = require('http');

// Sean's SMS Gateway credentials
const SMS_GATEWAY_CONFIG = {
  email: 'sean@trurankdigital.com',
  password: 'Croatia5376!',
  provider: 'smsgateway'
};

// Test configuration
const TEST_CONFIG = {
  from: '13475522092', // Sean's correct number
  to: '14176297373',   // Your number
  message: 'Test SMS from TRD System via SMS Gateway - ' + new Date().toLocaleTimeString()
};

console.log('🚀 Starting SMS Gateway Test...');
console.log('📱 From:', TEST_CONFIG.from);
console.log('📱 To:', TEST_CONFIG.to);
console.log('💬 Message:', TEST_CONFIG.message);
console.log('🔧 Using credentials for:', SMS_GATEWAY_CONFIG.email);
console.log('─'.repeat(50));

// Function to make HTTP requests with detailed logging
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    console.log('🌐 Making request to:', options.hostname + options.path);
    console.log('📝 Method:', options.method);
    console.log('📋 Headers:', JSON.stringify(options.headers, null, 2));
    
    if (postData) {
      console.log('📤 Request Body:', postData);
    }
    
    const protocol = options.port === 443 ? https : http;
    const req = protocol.request(options, (res) => {
      console.log('📊 Response Status:', res.statusCode);
      console.log('📊 Response Headers:', JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📥 Response Body:', data);
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request Error:', err.message);
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test different SMS Gateway endpoints
async function testSMSGateway() {
  console.log('\n🧪 Testing SMS Gateway Integration...\n');
  
  try {
    // Test 1: Try the SMS Gateway cloud service
    console.log('📍 Test 1: Attempting SMS Gateway cloud service (api.sms-gate.app)...');
    
    const webApiOptions = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/api/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(SMS_GATEWAY_CONFIG.email + ':' + SMS_GATEWAY_CONFIG.password).toString('base64')}`
      }
    };
    
    const webApiData = JSON.stringify({
      phone: TEST_CONFIG.to,
      message: TEST_CONFIG.message
    });
    
    try {
      const webResult = await makeRequest(webApiOptions, webApiData);
      console.log('✅ Web API Test Result:', webResult);
    } catch (webError) {
      console.log('❌ Web API failed:', webError.message);
    }
    
    // Test 2: Try Sean's public IP SMS Gateway app endpoint (port 8080)
    console.log('\n📍 Test 2: Attempting Sean\'s public IP endpoint (74.66.100.222:8080)...');
    
    const publicApiOptions = {
      hostname: '74.66.100.222',
      port: 8080,
      path: '/api/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(SMS_GATEWAY_CONFIG.email + ':' + SMS_GATEWAY_CONFIG.password).toString('base64')}`
      }
    };
    
    const localApiData = JSON.stringify({
      phone: TEST_CONFIG.to,
      message: TEST_CONFIG.message,
      from: TEST_CONFIG.from
    });
    
    try {
      const publicResult = await makeRequest(publicApiOptions, localApiData);
      console.log('✅ Public IP Test Result:', publicResult);
    } catch (publicError) {
      console.log('❌ Public IP failed:', publicError.message);
    }
    
    // Test 3: Try alternative endpoint paths on Sean's public IP
    console.log('\n📍 Test 3: Trying alternative endpoints on Sean\'s public IP...');
    
    const altPaths = ['/send', '/sms', '/api/v1/send', '/message'];
    
    for (const path of altPaths) {
      console.log(`\n🔍 Trying path: ${path} on 74.66.100.222:8080`);
      
      const altOptions = {
        hostname: '74.66.100.222',
        port: 8080,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(SMS_GATEWAY_CONFIG.email + ':' + SMS_GATEWAY_CONFIG.password).toString('base64')}`
        }
      };
      
      try {
        const altResult = await makeRequest(altOptions, localApiData);
        console.log(`✅ ${path} Result:`, altResult);
        
        if (altResult.status === 200) {
          console.log('🎉 SUCCESS! Found working endpoint:', path);
          break;
        }
      } catch (altError) {
        console.log(`❌ ${path} failed:`, altError.message);
      }
    }
    
    // Test 4: Check if Sean's SMS Gateway app is running
    console.log('\n📍 Test 4: Checking if Sean\'s SMS Gateway app is accessible...');
    
    const healthCheckOptions = {
      hostname: '74.66.100.222',
      port: 8080,
      path: '/',
      method: 'GET',
      headers: {}
    };
    
    try {
      const healthResult = await makeRequest(healthCheckOptions);
      console.log('✅ Health Check Result:', healthResult);
    } catch (healthError) {
      console.log('❌ Health check failed:', healthError.message);
      console.log('💡 This suggests Sean\'s SMS Gateway app might not be running on 74.66.100.222:8080');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test via our TRD API (simulating the real flow)
async function testViaTRDAPI() {
  console.log('\n🏢 Testing via TRD SMS API...\n');
  
  const trdApiOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/sms/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const trdApiData = JSON.stringify({
    phoneNumbers: [TEST_CONFIG.to],
    message: TEST_CONFIG.message,
    provider: 'personal',
    credentials: SMS_GATEWAY_CONFIG
  });
  
  try {
    const trdResult = await makeRequest(trdApiOptions, trdApiData);
    console.log('✅ TRD API Test Result:', trdResult);
  } catch (trdError) {
    console.log('❌ TRD API failed:', trdError.message);
    console.log('💡 Make sure your Next.js dev server is running on port 3000');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🎯 SMS Gateway Test Suite');
  console.log('🕐 Started at:', new Date().toISOString());
  console.log('═'.repeat(60));
  
  await testSMSGateway();
  
  console.log('\n' + '═'.repeat(60));
  
  await testViaTRDAPI();
  
  console.log('\n' + '═'.repeat(60));
  console.log('🏁 Test Suite Completed at:', new Date().toISOString());
  console.log('💡 Check the logs above to see which endpoints worked');
}

// Run the tests
runAllTests().catch(console.error); 