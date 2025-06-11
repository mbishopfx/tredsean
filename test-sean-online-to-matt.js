const https = require('https');

console.log('🔄 SMS Gateway Test - Sean Online');
console.log('==================================');

const testConfig = {
  phoneNumber: '+14176297373',  // Matt's number (7373)
  message: 'SMS test after restart - ' + new Date().toLocaleTimeString() + ' - App confirmed online!',
  seanCredentials: 'BGELNS:mxahcnqjgirfpd'  // Sean's corrected credentials
};

console.log('📱 From: Sean\'s SMS Gateway');
console.log('📱 To: +14176297373 (Matt)');
console.log(`💬 Message: ${testConfig.message}`);
console.log('🟢 Status: Gateway confirmed online');
console.log('📡 Endpoint: /mobile/v1');
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
            console.log('✅ SUCCESS! Message queued!');
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 Status: ${parsed.state}`);
            console.log('');
            console.log('🎉 Message sent from Sean to Matt!');
            console.log('📱 Check your phone for the message');
            console.log('🔄 With restart + RCS disabled + app online = should work!');
            resolve(parsed);
          } catch (e) {
            console.log('✅ Message sent successfully!');
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          console.log('🚨 401 - Authentication issue');
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
    console.log('🚀 Sending message from Sean to Matt...');
    const result = await testSMSGateway();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 