const https = require('https');

console.log('🧪 Testing Original Number (4176297373)');
console.log('=======================================');

const testConfig = {
  originalNumber: '+14176297373', // Matt's original number
  message: 'Test to original number - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.originalNumber}`);
console.log(`💬 Message: ${testConfig.message}`);
console.log('⏰ Time:', new Date().toISOString());
console.log('');

function sendTestMessage() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.originalNumber]
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

async function runTest() {
  try {
    console.log('🚀 Starting test to original number...');
    const result = await sendTestMessage();
    
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('📱 Please check your phone (4176297373) for the message');
    console.log('');
    console.log('🔍 This will help determine:');
    console.log('  ✅ If delivery works to non-TracFone numbers');
    console.log('  ✅ If the issue is TracFone-specific blocking');
    console.log('  ✅ If SMS Gateway is working for regular carriers');
    
  } catch (error) {
    console.log('');
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 