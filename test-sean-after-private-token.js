const https = require('https');

console.log('🔐 TESTING SEAN AFTER ENABLING PRIVATE TOKEN');
console.log('============================================');
console.log('Checking if Private Token enables hashing like Jon');
console.log('');

const seanCredentials = '_WPYVV:xvqlgyspgvx5hy';

function testSeanWithPrivateToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: 'SEAN PRIVATE TOKEN TEST - ' + new Date().toLocaleTimeString() + ' - Should work now!',
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
        console.log('📡 SEAN\'S RESPONSE AFTER PRIVATE TOKEN:');
        console.log('======================================');
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        console.log('');
        
        // Check initial response
        if (parsed.isHashed) {
          console.log('🎉 SUCCESS! Sean now shows isHashed: true in initial response!');
        } else {
          console.log('❌ Still showing isHashed: false in initial response');
        }
        
        if (res.statusCode === 202) {
          setTimeout(() => {
            console.log('📊 CHECKING FINAL STATUS WITH PRIVATE TOKEN...');
            console.log('===============================================');
            
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
                console.log('📋 SEAN\'S FINAL STATUS WITH PRIVATE TOKEN:');
                console.log('==========================================');
                console.log(JSON.stringify(status, null, 2));
                console.log('');
                
                console.log('🔍 HASHING STATUS COMPARISON:');
                console.log('=============================');
                console.log(`Sean NOW: "isHashed": ${status.isHashed}`);
                console.log('Jon:      "isHashed": true');
                console.log('');
                
                if (status.isHashed === true) {
                  console.log('🎉 BREAKTHROUGH! Sean now has hashing enabled!');
                  console.log('📱 Phone number format:', status.recipients[0]?.phoneNumber);
                  console.log('✅ This should match Jon\'s working format!');
                  console.log('');
                  console.log('📱 CHECK YOUR PHONE NOW!');
                  console.log('You should receive Sean\'s message this time!');
                } else {
                  console.log('❌ Private Token didn\'t enable hashing');
                  console.log('💡 Try checking other settings in Sean\'s app');
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
    console.log('🚀 Testing Sean after enabling Private Token...');
    console.log('📱 Make sure Private Token is ENABLED in Sean\'s SMS Gateway app first!');
    console.log('');
    await testSeanWithPrivateToken();
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 