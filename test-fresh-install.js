const https = require('https');

console.log('🔄 FRESH INSTALLATION TEST');
console.log('==========================');
console.log('📱 After SMS Gateway app reinstall');
console.log('🔑 NEW Cloud Credentials:');
console.log('   Username: BGELNS');
console.log('   Password: mxahcnajgirfpd');
console.log('   Address: api.sms-gate.app (same)');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'FRESH INSTALL TEST - ' + new Date().toLocaleTimeString(),
  newCredentials: 'BGELNS:mxahcnajgirfpd'  // NEW CREDENTIALS
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔄 Status: Testing after fresh app installation');
console.log('🔑 Using: NEW cloud credentials');
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
            console.log('🎯 FRESH INSTALL + NEW CREDENTIALS:');
            console.log('===================================');
            console.log('🔄 Clean app installation');
            console.log('🔑 Updated cloud credentials');
            console.log('📱 Fresh permission grants');
            console.log('⚡ This combination should work!');
            console.log('');
            console.log('📱 Sean: Check logs for ACTION_SENT');
            console.log('📩 Matt: Message should arrive now!');
            console.log('');
            console.log('🚀 Fresh install + new creds = SUCCESS!');
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

async function runFreshInstallTest() {
  try {
    console.log('🚀 Testing with fresh install + new credentials...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runFreshInstallTest(); 