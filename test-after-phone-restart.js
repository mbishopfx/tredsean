const https = require('https');

console.log('🔄 Testing SMS Gateway After Phone Restart');
console.log('Using Jose\'s credentials with MOBILE endpoint');
console.log('============================================');

const testConfig = {
  phoneNumber: '+14176297373',
  message: 'Post-restart SMS test - ' + new Date().toLocaleTimeString(),
  credentials: '_NNSZW:9qajexoy9ihhnl'
};

console.log(`📱 Sending to: ${testConfig.phoneNumber}`);
console.log(`💬 Message: ${testConfig.message}`);
console.log('📡 Endpoint: /mobile/v1 (correct endpoint)');
console.log('🔑 Using Jose credentials');
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
      path: '/mobile/v1/message',
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
            console.log('🎉 SUCCESS - Message sent to SMS Gateway!');
            console.log('📱 Check your phone now for the message!');
            console.log('🔄 With phone restart + RCS disabled, should arrive fast');
            resolve(parsed);
          } catch (e) {
            console.log('✅ Message sent (could not parse response)');
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          console.log('🚨 401 Unauthorized - credential issue');
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
    console.log('🚀 Sending test message...');
    const result = await testSMSGateway();
    
    console.log('');
    console.log('🎯 Test completed successfully!');
    console.log('📱 Message should arrive on your phone shortly');
    console.log('💡 If it arrives, the restart fixed the delivery issue');
    
  } catch (error) {
    console.log('');
    console.log('❌ Test failed:', error.message);
    console.log('💡 May need to check SMS Gateway credentials or status');
  }
}

runTest(); 