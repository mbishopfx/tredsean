const https = require('https');

console.log('🔄 SMS Gateway Test After Phone Restart');
console.log('Corrected password + Mobile endpoint');
console.log('====================================');

const testConfig = {
  phoneNumber: '+14176297373',
  message: 'RESTART TEST - ' + new Date().toLocaleTimeString() + ' - Should work now!',
  credentials: 'BGELNS:mxahcnqjgirfpd'  // CORRECTED PASSWORD
};

console.log(`📱 Sending to: ${testConfig.phoneNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔑 Credentials: BGELNS:mxahcnqjgirfpd (corrected)');
console.log('📡 Endpoint: /mobile/v1 (correct endpoint)');
console.log('🔄 Phone restarted, RCS disabled');
console.log('');

function testSMSGateway() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.phoneNumber]
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/mobile/v1/message',  // CORRECT ENDPOINT
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
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Data: ${responseData}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log('✅ Message queued successfully!');
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 Status: ${parsed.state}`);
            console.log('');
            console.log('🎉 SUCCESS - All fixes applied!');
            console.log('================================');
            console.log('✅ Corrected password');
            console.log('✅ Correct mobile endpoint');
            console.log('✅ Phone restarted');
            console.log('✅ RCS disabled');
            console.log('');
            console.log('📱 Message should arrive on your phone NOW!');
            console.log('🚀 This combination should work perfectly');
            resolve(parsed);
          } catch (e) {
            console.log('✅ Message sent (could not parse response)');
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          console.log('🚨 401 - Still authentication issue');
          console.log('💡 Sean: Double-check SMS Gateway app is connected');
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

async function runTest() {
  try {
    console.log('🚀 Sending test message with all fixes...');
    const result = await testSMSGateway();
    
    console.log('');
    console.log('🎯 Test completed successfully!');
    console.log('📱 Check your phone - message should arrive shortly');
    console.log('💡 If successful, all our troubleshooting worked!');
    
  } catch (error) {
    console.log('');
    console.log('❌ Test failed:', error.message);
    console.log('💡 May need to verify SMS Gateway app status');
  }
}

runTest(); 