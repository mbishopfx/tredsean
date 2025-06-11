const https = require('https');

console.log('🔐 Testing After SMS Permissions Check');
console.log('====================================');
console.log('📖 Based on official documentation:');
console.log('   SEND_SMS permission is REQUIRED for SMS Gateway');
console.log('   Without it: shows "sent" but doesn\'t actually send');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'PERMISSIONS TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔐 After: SMS Gateway SEND_SMS permission check');
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
            console.log('🎯 CRITICAL TEST:');
            console.log('================');
            console.log('📱 Check Sean\'s phone: Does it show "sent"?');
            console.log('📩 Check your phone: Do you RECEIVE the message?');
            console.log('');
            console.log('✅ If BOTH happen: SEND_SMS permission fixed it!');
            console.log('❌ If only Sean\'s shows "sent": Permission still missing');
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

async function runPermissionsTest() {
  try {
    console.log('🚀 Testing SMS Gateway after permissions check...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runPermissionsTest(); 