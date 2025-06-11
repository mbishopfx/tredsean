const https = require('https');

console.log('🔑 TESTING SEAN AFTER SETTING PUBLIC TOKEN');
console.log('=========================================');
console.log('📱 Testing if public token enables hashing');
console.log('🎯 Looking for isHashed: true in response');
console.log('');

const testConfig = {
  phoneNumber: '+14176297373',
  message: 'Sean PUBLIC TOKEN test - ' + new Date().toLocaleTimeString() + ' - Testing hashing!',
  seanCredentials: 'BGELNS:mxahcnqjgirfpd'
};

console.log(`📱 From: Sean SMS Gateway (with public token)`);
console.log(`📱 To: ${testConfig.phoneNumber}`);
console.log(`💬 Message: ${testConfig.message}`);
console.log('🔑 Credentials: BGELNS:mxahcnqjgirfpd');
console.log('📡 Endpoint: /3rdparty/v1');
console.log('🎯 Checking if public token enables isHashed=true');
console.log('');

function testSeanWithToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.phoneNumber]
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
            console.log('✅ Message queued!');
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`🔒 IsHashed: ${parsed.isHashed}`);
            console.log(`📱 State: ${parsed.state}`);
            
            if (parsed.isHashed === true) {
              console.log('');
              console.log('🎉 SUCCESS! PUBLIC TOKEN ENABLED HASHING!');
              console.log('====================================');
                             console.log('✅ Sean\'s device now has privacy mode enabled');
               console.log('✅ Messages should now deliver properly');
              console.log('📱 Check phone for message delivery');
              
              // Check status after delay
              setTimeout(() => {
                console.log('');
                console.log('🔍 Checking message status...');
                const statusReq = https.request({
                  hostname: 'api.sms-gate.app',
                  port: 443,
                  path: `/3rdparty/v1/message/${parsed.id}`,
                  method: 'GET',
                  headers: {
                    'Authorization': `Basic ${Buffer.from(testConfig.seanCredentials).toString('base64')}`
                  }
                }, (statusRes) => {
                  let statusData = '';
                  statusRes.on('data', (chunk) => { statusData += chunk; });
                  statusRes.on('end', () => {
                    console.log('📊 Status Check:', statusData);
                    const statusParsed = JSON.parse(statusData);
                    if (statusParsed.state === 'Sent') {
                                             console.log('🎉 CONFIRMED: Message SENT successfully!');
                       console.log('✅ Sean\'s device is now working!');
                    } else {
                      console.log(`📊 Current state: ${statusParsed.state}`);
                    }
                  });
                });
                statusReq.end();
              }, 15000);
              
            } else {
              console.log('');
              console.log('❌ Still isHashed: false');
              console.log('💡 Public token might not be the solution');
              console.log('🔧 Check other settings differences with Jon');
            }
            
            resolve(parsed);
          } catch (e) {
            console.log('✅ Message sent (could not parse response)');
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

async function runTest() {
  try {
    console.log('🚀 Testing Sean with public token...');
    await testSeanWithToken();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 