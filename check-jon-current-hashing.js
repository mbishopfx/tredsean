const https = require('https');

console.log('🔍 CHECKING JON\'S CURRENT HASHING STATUS');
console.log('=========================================');
console.log('Testing if Jon still gets isHashed:true');
console.log('');

const jonCredentials = 'AD2XA0:2nitkjiqnmrrtc';

function testJonHashing() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: 'JON HASHING CHECK - ' + new Date().toLocaleTimeString(),
      phoneNumbers: ['+14176297373']
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(jonCredentials).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 JON\'S CURRENT API RESPONSE:');
        console.log('===============================');
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        console.log('');
        
        if (res.statusCode === 202) {
          setTimeout(() => {
            console.log('📊 CHECKING JON\'S CURRENT STATUS...');
            console.log('===================================');
            
            const statusReq = https.request({
              hostname: 'api.sms-gate.app',
              port: 443,
              path: `/3rdparty/v1/message/${parsed.id}`,
              method: 'GET',
              headers: {
                'Authorization': `Basic ${Buffer.from(jonCredentials).toString('base64')}`
              }
            }, (statusRes) => {
              let statusData = '';
              statusRes.on('data', (chunk) => { statusData += chunk; });
              statusRes.on('end', () => {
                const status = JSON.parse(statusData);
                console.log('📋 JON\'S CURRENT DETAILED STATUS:');
                console.log('=================================');
                console.log(JSON.stringify(status, null, 2));
                console.log('');
                
                console.log('🔍 HASHING COMPARISON:');
                console.log('======================');
                console.log(`Jon NOW: "isHashed": ${status.isHashed}`);
                console.log('Sean:    "isHashed": false');
                console.log('');
                
                if (status.isHashed === true) {
                  console.log('✅ Jon still has hashing enabled - this explains why he works!');
                  console.log('❌ Sean has hashing disabled - this explains the false positive!');
                } else if (status.isHashed === false) {
                  console.log('⚠️  Jon NOW also shows false - service may have changed globally');
                  console.log('🤔 But Jon still delivers - need to investigate further');
                }
                
                console.log('');
                console.log('📱 CHECK YOUR PHONE:');
                console.log('Did you receive Jon\'s test message?');
                
                resolve(status);
              });
            });
            statusReq.end();
          }, 10000);
          
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
    await testJonHashing();
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTest(); 