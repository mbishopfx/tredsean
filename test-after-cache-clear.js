const https = require('https');

console.log('🧪 Testing After Cache Clear & Restart');
console.log('======================================');

const testConfig = {
  yourNumber: '+14176297373', // Matt's number
  message: 'CACHE CLEARED TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('⏰ Time:', new Date().toISOString());
console.log('🔄 After: Cache cleared & SMS Gateway app restarted');
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
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Data: ${responseData}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ Message queued successfully!`);
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 Status: ${parsed.state}`);
            console.log('');
            console.log('🕐 Now checking Sean\'s phone to see if it shows "sent"...');
            console.log('📱 AND checking your phone for actual delivery!');
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

async function runCacheClearTest() {
  try {
    console.log('🚀 Testing SMS Gateway after cache clear...');
    const result = await sendTestMessage();
    
    console.log('');
    console.log('🎯 SUCCESS INDICATORS:');
    console.log('======================');
    console.log('✅ Message queued in SMS Gateway cloud service');
    console.log('📱 Next: Check Sean\'s phone shows message as "sent"');
    console.log('📩 Next: Check your phone (4176297373) receives message');
    console.log('');
    console.log('🔍 If both happen: SMS Gateway is fixed!');
    console.log('❌ If only Sean\'s shows "sent": Still a delivery issue');
    
  } catch (error) {
    console.log('');
    console.log('❌ Test failed:', error.message);
    console.log('💡 SMS Gateway app may need additional troubleshooting');
  }
}

runCacheClearTest(); 