const https = require('https');

console.log('⚡ Testing NOW - After Proper Restart');
console.log('====================================');
console.log('✅ Sean has restarted SMS Gateway app');
console.log('✅ "Allow Always" permission confirmed');
console.log('✅ App should be fully operational now');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'NOW TESTING - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('⏰ Timing: Right after proper restart');
console.log('');

function sendTestMessage() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.yourNumber]
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
        console.log(`📊 API Response: ${res.statusCode}`);
        console.log(`📋 Response Data: ${responseData}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ Message queued: ${parsed.id}`);
            console.log('');
            console.log('🎯 THIS IS THE MOMENT:');
            console.log('=====================');
            console.log('⚡ Perfect timing: App just restarted');
            console.log('🔐 Permission: Allow Always active');
            console.log('📱 Sean: Check for "sent" status');
            console.log('📩 Matt: Check for message delivery');
            console.log('');
            console.log('🚀 If this works: SMS Gateway is FIXED!');
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

async function runNowTest() {
  try {
    console.log('🚀 Testing NOW with perfect timing...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runNowTest(); 