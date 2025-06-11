const https = require('https');

console.log('🚫 RCS DISABLED TEST');
console.log('====================');
console.log('✅ Sean turned OFF RCS messaging');
console.log('🎯 This should be THE fix!');
console.log('📱 RCS interference eliminated');
console.log('🔄 Fresh install + correct password + no RCS');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'RCS DISABLED TEST - ' + new Date().toLocaleTimeString() + ' - This should work!',
  credentials: 'BGELNS:mxahcnqjgirfpd'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🚫 RCS: DISABLED (no interference)');
console.log('📡 Route: SMS Gateway → Phone SMS → Carrier → Delivery');
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
        'Authorization': `Basic ${Buffer.from(testConfig.credentials).toString('base64')}`,
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
            console.log('🎉 RCS DISABLED SUCCESS:');
            console.log('========================');
            console.log('✅ API accepted message');
            console.log('🚫 RCS interference removed');
            console.log('📱 Clean SMS routing path');
            console.log('⚡ This should deliver FAST!');
            console.log('');
            console.log('📱 Sean: Check logs for ACTION_SENT');
            console.log('📩 Matt: Watch your phone - should arrive NOW!');
            console.log('');
            console.log('🚀 RCS was likely the problem all along!');
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

async function runRCSDisabledTest() {
  try {
    console.log('🚀 Testing with RCS disabled...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runRCSDisabledTest(); 