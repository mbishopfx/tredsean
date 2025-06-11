const https = require('https');

console.log('🧪 Testing SMS Gateway After Restart');
console.log('====================================');

// Test configuration
const testConfig = {
  phoneNumber: '+16467705587', // The number that was working before
  message: 'SMS Gateway restart test - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.phoneNumber}`);
console.log(`💬 Message: ${testConfig.message}`);
console.log('⏰ Time:', new Date().toISOString());
console.log('');

// Test Sean's SMS Gateway
function testSMSGateway() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.phoneNumber]
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(testConfig.seanCredentials).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Data: ${responseData}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ Message queued successfully!`);
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 Status: ${parsed.state}`);
            resolve(parsed);
          } catch (e) {
            console.log(`✅ Message sent (could not parse response)`);
            resolve(responseData);
          }
        } else {
          console.log(`❌ Failed with status ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    console.log('🚀 Starting SMS Gateway test...');
    const result = await testSMSGateway();
    
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('📱 Please check phone', testConfig.phoneNumber, 'for the message');
    console.log('💡 If message arrives, SMS Gateway is working properly');
    
  } catch (error) {
    console.log('');
    console.log('❌ Test failed:', error.message);
    console.log('💡 SMS Gateway may need additional troubleshooting');
  }
}

runTest(); 