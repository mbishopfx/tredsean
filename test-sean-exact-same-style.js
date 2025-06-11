const https = require('https');

console.log('🔄 TESTING SEAN - EXACT SAME STYLE AS JON');
console.log('=========================================');
console.log('📱 Using Sean\'s fresh credentials');
console.log('🎯 Same format that worked for Jon');
console.log('');

const testConfig = {
  phoneNumber: '+14176297373',
  message: 'SEAN SAME STYLE TEST - ' + new Date().toLocaleTimeString() + ' - Should work like Jon!',
  seanCredentials: '_WPYVV:xvqlgyspgvx5hy'
};

console.log(`📱 From: Sean SMS Gateway (EXACT SAME STYLE)`);
console.log(`📱 To: ${testConfig.phoneNumber}`);
console.log(`💬 Message: ${testConfig.message}`);
console.log('🔑 Sean Credentials: _WPYVV:xvqlgyspgvx5hy');
console.log('📡 Endpoint: /3rdparty/v1');
console.log('🎯 Using identical format to Jon\'s working test');
console.log('');

function testSeanSameStyle() {
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
        if (res.statusCode === 202) {
          const parsed = JSON.parse(responseData);
          console.log('✅ Sean Message queued:', parsed.id);
          console.log('📱 Sean State:', parsed.state);
          console.log('');
          console.log('📱 CHECK PHONE - SEAN\'S MESSAGE SHOULD ARRIVE!');
          
          setTimeout(() => {
            console.log('Checking Sean delivery status...');
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
                const status = JSON.parse(statusData);
                console.log('📊 Sean Final Status:', status.state);
                
                if (status.state === 'Sent') {
                  console.log('✅ SEAN SHOWS DELIVERED!');
                  console.log('🎯 Sean\'s device claims success!');
                  console.log('');
                  console.log('📱 DID YOU RECEIVE SEAN\'S MESSAGE?');
                  console.log('If NO: Sean\'s device has false positive');
                  console.log('If YES: Sean\'s device is working!');
                } else {
                  console.log('❌ Sean delivery failed - status:', status.state);
                }
                
                console.log('');
                console.log('🔍 COMPARISON:');
                console.log('==============');
                console.log('Jon: Shows Sent + Actually delivers ✅');
                console.log('Sean: Shows Sent + ???');
                console.log('');
                console.log('📋 Next steps if Sean doesn\'t deliver:');
                console.log('1. Check Sean\'s SMS permissions');
                console.log('2. Check Sean\'s default SMS app setting');
                console.log('3. Check Sean\'s network connection');
                console.log('4. Check for carrier differences');
                
                resolve(status);
              });
            });
            statusReq.end();
          }, 15000);
          
        } else {
          console.log('❌ Sean failed:', responseData);
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
    console.log('🚀 Testing Sean with exact same style as Jon...');
    await testSeanSameStyle();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 