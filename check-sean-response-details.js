const https = require('https');

console.log('🔍 CHECKING SEAN\'S DETAILED API RESPONSE');
console.log('==========================================');
console.log('Looking for hashing differences vs Jon\'s working format');
console.log('');

const seanCredentials = '_WPYVV:xvqlgyspgvx5hy';

function sendMessageAndCheckDetails() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: 'HASHING TEST - ' + new Date().toLocaleTimeString(),
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
        console.log('📡 SEAN\'S INITIAL API RESPONSE:');
        console.log('================================');
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        console.log('');
        
        if (res.statusCode === 202) {
          setTimeout(() => {
            console.log('📊 CHECKING DETAILED STATUS...');
            console.log('==============================');
            
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
                console.log('📋 SEAN\'S DETAILED STATUS RESPONSE:');
                console.log('===================================');
                console.log(JSON.stringify(status, null, 2));
                console.log('');
                
                // Check for hashing
                if (status.isHashed !== undefined) {
                  console.log(`🔑 isHashed: ${status.isHashed}`);
                } else {
                  console.log('❌ No isHashed field found');
                }
                
                if (status.phoneNumbers) {
                  console.log('📱 Phone numbers in response:');
                  status.phoneNumbers.forEach((num, i) => {
                    console.log(`  ${i + 1}. ${num}`);
                  });
                }
                
                console.log('');
                console.log('🔍 COMPARISON TO JON\'S WORKING FORMAT:');
                console.log('======================================');
                console.log('Jon\'s working messages had:');
                console.log('- "isHashed": true');
                console.log('- Phone numbers like: "0013492ad2039554"');
                console.log('');
                console.log('Sean\'s message shows:');
                console.log(`- "isHashed": ${status.isHashed || 'not found'}`);
                if (status.phoneNumbers) {
                  console.log(`- Phone numbers: ${status.phoneNumbers.join(', ')}`);
                }
                
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

async function runCheck() {
  try {
    await sendMessageAndCheckDetails();
  } catch (error) {
    console.log('❌ Check failed:', error.message);
  }
}

runCheck(); 