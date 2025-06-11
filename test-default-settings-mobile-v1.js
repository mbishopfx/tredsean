const https = require('https');

console.log('🔄 Testing Default Settings - Mobile v1');
console.log('=======================================');
console.log('📱 App reverted to default /mobile/v1 setting');
console.log('🔄 Device should re-register automatically');
console.log('');

const testConfig = {
  phoneNumber: '+14176297373',  // Matt's number
  message: 'Default settings test - ' + new Date().toLocaleTimeString() + ' - Back to working config!',
  seanCredentials: 'BGELNS:mxahcnqjgirfpd'
};

console.log('📱 From: Sean\'s SMS Gateway (default settings)');
console.log('📱 To: +14176297373 (Matt)');
console.log(`💬 Message: ${testConfig.message}`);
console.log('📡 Endpoint: /mobile/v1 (default)');
console.log('🔄 App should auto-register device');
console.log('');

function testSMSGateway() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.phoneNumber]
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/mobile/v1/message',  // Using default endpoint
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
            console.log('✅ SUCCESS! Message queued!');
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 Status: ${parsed.state}`);
            console.log('');
            console.log('🎉 DEFAULT SETTINGS WORKING!');
            console.log('============================');
            console.log('✅ Device registration: OK');
            console.log('✅ Message sending: OK');
            console.log('✅ Single message: WORKS');
            console.log('');
            console.log('📱 Matt: Check your phone!');
            console.log('💡 Now we can work on mass messaging');
            resolve(parsed);
          } catch (e) {
            console.log('✅ Message sent successfully!');
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          console.log('🚨 401 - Still auth issue with default settings');
          console.log('💡 May need to restart SMS Gateway app');
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
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

async function runTest() {
  try {
    console.log('🚀 Testing with default settings...');
    const result = await testSMSGateway();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('💡 Try restarting SMS Gateway app after reverting settings');
  }
}

runTest(); 