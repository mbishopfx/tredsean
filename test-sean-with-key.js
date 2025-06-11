const https = require('https');

console.log('🔑 TESTING SEAN AFTER SETTING KEY: trd123');
console.log('==========================================');
console.log('Checking if setting key "trd123" enabled hashing');
console.log('');

const seanCredentials = '_WPYVV:xvqlgyspgvx5hy';

function testSeanWithKey() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: 'SEAN KEY TEST (trd123) - ' + new Date().toLocaleTimeString() + ' - Key should enable hashing!',
      phoneNumbers: ['+14176297373']
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(seanCredentials).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 SEAN\'S RESPONSE AFTER SETTING KEY:');
        console.log('====================================');
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        console.log('');
        
        // Check initial response
        if (parsed.isHashed) {
          console.log('🎉 SUCCESS! Key "trd123" enabled hashing in initial response!');
        } else {
          console.log('⏳ Initial response still shows isHashed: false, checking final status...');
        }
        
        if (res.statusCode === 202) {
          setTimeout(() => {
            console.log('📊 CHECKING FINAL STATUS AFTER KEY SETTING...');
            console.log('==============================================');
            
            const statusReq = https.request({
              hostname: 'api.sms-gate.app',
              port: 443,
              path: `/3rdparty/v1/message/${parsed.id}`,
              method: 'GET',
              headers: {
                'Authorization': `Basic ${Buffer.from(seanCredentials).toString('base64')}`
              }
            }, (statusRes) => {
              let statusData = '';
              statusRes.on('data', (chunk) => { statusData += chunk; });
              statusRes.on('end', () => {
                const status = JSON.parse(statusData);
                console.log('📋 SEAN\'S FINAL STATUS WITH KEY:');
                console.log('================================');
                console.log(JSON.stringify(status, null, 2));
                console.log('');
                
                console.log('🔍 CRITICAL COMPARISON:');
                console.log('=======================');
                console.log(`Sean with key: "isHashed": ${status.isHashed}`);
                console.log('Jon working:   "isHashed": true');
                console.log('');
                
                if (status.isHashed === true) {
                  console.log('🎉 BREAKTHROUGH! KEY ENABLED HASHING!');
                  console.log('📱 Phone number now shows:', status.recipients[0]?.phoneNumber);
                  console.log('✅ Should be hashed format like Jon\'s!');
                  console.log('');
                  console.log('📱 CHECK YOUR PHONE - MESSAGE SHOULD ARRIVE!');
                  console.log('🎯 Sean\'s device should now work like Jon\'s!');
                } else {
                  console.log('❌ Key didn\'t enable hashing yet');
                  console.log('📱 Phone number still:', status.recipients[0]?.phoneNumber);
                  console.log('💡 May need to restart SMS Gateway app or wait for sync');
                }
                
                console.log('');
                console.log('📊 STATUS PROGRESSION:');
                if (status.states) {
                  Object.entries(status.states).forEach(([state, time]) => {
                    console.log(`  ${state}: ${time}`);
                  });
                }
                
                resolve(status);
              });
            });
            statusReq.end();
          }, 12000);
          
        } else {
          console.log('❌ Failed:', responseData);
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
    console.log('🚀 Testing Sean after setting key "trd123"...');
    console.log('🔑 Key should activate privacy/hashing mode');
    console.log('');
    await testSeanWithKey();
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 