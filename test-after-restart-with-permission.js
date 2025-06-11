const https = require('https');

console.log('🔄 Testing After App Restart + Allow Always');
console.log('===========================================');
console.log('✅ SMS Gateway permission: "Allow Always"');
console.log('🔄 SMS Gateway app: Restarted completely');
console.log('🎯 This combination should definitely work!');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'RESTART + PERMISSION TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔐 Permission: ✅ Allow Always (after restart)');
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
            console.log('🎯 FINAL TEST MOMENT:');
            console.log('====================');
            console.log('🔄 App restarted: ✅');
            console.log('🔐 Permission set: ✅ Allow Always');
            console.log('📡 API working: ✅');
            console.log('');
            console.log('📱 Check Sean\'s phone: Shows "sent"?');
            console.log('📩 Check your phone: Receive message?');
            console.log('');
            console.log('🎉 If YES: SMS Gateway is FULLY WORKING!');
            console.log('❌ If NO: May need deeper Android investigation');
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

async function runRestartTest() {
  try {
    console.log('🚀 Running post-restart test...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runRestartTest(); 