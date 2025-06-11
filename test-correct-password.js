const https = require('https');

console.log('🔧 CORRECTED PASSWORD TEST');
console.log('===========================');
console.log('🚨 Found password typo!');
console.log('❌ Wrong: mxahcnajgirfpd (with "a")');
console.log('✅ Correct: mxahcnqjgirfpd (with "q")');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'CORRECTED PASSWORD TEST - ' + new Date().toLocaleTimeString(),
  correctCredentials: 'BGELNS:mxahcnqjgirfpd'  // CORRECTED PASSWORD
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔑 Credentials: BGELNS:mxahcnqjgirfpd (corrected)');
console.log('🎯 This should work now!');
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
        'Authorization': `Basic ${Buffer.from(testConfig.correctCredentials).toString('base64')}`,
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
            console.log('🎯 PASSWORD CORRECTION SUCCESS:');
            console.log('===============================');
            console.log('✅ Credentials accepted!');
            console.log('🔧 Typo was the issue');
            console.log('📱 Fresh install + correct password');
            console.log('🚀 This should deliver now!');
            console.log('');
            console.log('📱 Sean: Check logs for ACTION_SENT');
            console.log('📩 Matt: Message should arrive!');
            resolve(parsed);
          } catch (e) {
            console.log(`✅ Message sent (could not parse response)`);
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          console.log('🚨 Still 401 - Need to double-check setup');
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

async function runCorrectedPasswordTest() {
  try {
    console.log('🚀 Testing with corrected password...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runCorrectedPasswordTest(); 