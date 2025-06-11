const https = require('https');

console.log('🎉 Testing IMMEDIATELY After Permission Granted');
console.log('===============================================');
console.log('✅ Sean confirmed: Got popup and clicked "Allow"');
console.log('✅ This granted SEND_SMS permission to SMS Gateway');
console.log('🎯 This should be THE test that finally works!');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'PERMISSION GRANTED TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔐 Permission Status: ✅ GRANTED (via popup)');
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
            console.log('🎉 MOMENT OF TRUTH:');
            console.log('==================');
            console.log('📱 Sean\'s phone: Should show "sent"');
            console.log('📩 YOUR phone: Should RECEIVE the message!');
            console.log('');
            console.log('🎯 If you receive this message:');
            console.log('   ✅ SMS Gateway is FIXED and ready for production!');
            console.log('   ✅ Single messages will work');
            console.log('   ✅ Mass campaigns will work');
            console.log('   ✅ Live app testing can begin');
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

async function runFinalTest() {
  try {
    console.log('🚀 Running THE final test...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runFinalTest(); 