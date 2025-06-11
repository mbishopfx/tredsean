const https = require('https');

console.log('🔄 TESTING MOBILE ENDPOINT');
console.log('==========================');
console.log('🚨 Got 401 with /3rdparty/v1');
console.log('🔄 Trying /mobile/v1 endpoint');
console.log('🔑 Credentials: BGELNS:mxahcnajgirfpd');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'MOBILE ENDPOINT TEST - ' + new Date().toLocaleTimeString(),
  newCredentials: 'BGELNS:mxahcnajgirfpd'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔄 Endpoint: /mobile/v1 (instead of /3rdparty/v1)');
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
      path: '/mobile/v1/message',  // CHANGED TO /mobile/v1
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(testConfig.newCredentials).toString('base64')}`,
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
            console.log('🎯 MOBILE ENDPOINT SUCCESS:');
            console.log('===========================');
            console.log('✅ /mobile/v1 worked!');
            console.log('🔑 New credentials accepted');
            console.log('📱 Fresh install + correct endpoint');
            console.log('');
            console.log('📱 Sean: Check logs for ACTION_SENT');
            console.log('📩 Matt: Message should arrive!');
            resolve(parsed);
          } catch (e) {
            console.log(`✅ Message sent (could not parse response)`);
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          console.log('🚨 Still 401 - Credential issue');
          console.log('❓ Sean: Double-check username/password?');
          console.log('❓ App showing "Connected" status?');
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

async function runMobileEndpointTest() {
  try {
    console.log('🚀 Testing /mobile/v1 endpoint...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runMobileEndpointTest(); 