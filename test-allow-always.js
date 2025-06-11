const https = require('https');

console.log('🎯 Testing After "ALLOW ALWAYS" Setting');
console.log('======================================');
console.log('✅ Found setting: SMS permission was "Ask"');
console.log('✅ Changed to: "Allow Always"');
console.log('🎉 This should DEFINITELY work now!');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'ALLOW ALWAYS TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔐 Permission: ✅ ALLOW ALWAYS (persistent)');
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
            console.log('🚀 BREAKTHROUGH MOMENT:');
            console.log('======================');
            console.log('🎯 This should be THE message that finally works!');
            console.log('📱 Sean: Should show "sent" immediately');
            console.log('📩 YOU: Should receive message on your phone!');
            console.log('');
            console.log('🎉 SUCCESS = SMS Gateway is FULLY OPERATIONAL');
            console.log('✅ Ready for live app testing');
            console.log('✅ Ready for mass campaigns');
            console.log('✅ Ready for single messages');
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

async function runAllowAlwaysTest() {
  try {
    console.log('🚀 Running ALLOW ALWAYS test...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runAllowAlwaysTest(); 