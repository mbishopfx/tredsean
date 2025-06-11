const https = require('https');

console.log('📱 DEVICE DELIVERY COMPARISON TEST');
console.log('==================================');
console.log('Testing if delivery is device-specific vs hashing');
console.log('');

const credentials = {
  jon: 'AD2XA0:2nitkjiqnmrrtc',
  sean: '_WPYVV:xvqlgyspgvx5hy', 
  jose: '_NNSZW:9qajexoy9ihhnl'
};

const phoneNumber = '+14176297373';

function sendAndTrack(name, creds, messageId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: `${name} DELIVERY TEST ${messageId} - ` + new Date().toLocaleTimeString() + ' - Check phone!',
      phoneNumbers: [phoneNumber]
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(creds).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 202) {
          const parsed = JSON.parse(responseData);
          console.log(`✅ ${name} queued: ${parsed.id} | isHashed: ${parsed.isHashed}`);
          
          // Check final status after delay
          setTimeout(() => {
            const statusReq = https.request({
              hostname: 'api.sms-gate.app',
              port: 443,
              path: `/3rdparty/v1/message/${parsed.id}`,
              method: 'GET',
              headers: {
                'Authorization': `Basic ${Buffer.from(creds).toString('base64')}`
              }
            }, (statusRes) => {
              let statusData = '';
              statusRes.on('data', (chunk) => { statusData += chunk; });
              statusRes.on('end', () => {
                const status = JSON.parse(statusData);
                console.log(`📊 ${name} final: ${status.state} | isHashed: ${status.isHashed} | Phone: ${status.recipients[0]?.phoneNumber}`);
                resolve({ name, status: status.state, isHashed: status.isHashed, phone: status.recipients[0]?.phoneNumber });
              });
            });
            statusReq.end();
          }, 15000);
          
        } else {
          console.log(`❌ ${name} failed:`, responseData);
          reject(new Error(`${name} failed`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${name} request failed:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runDeviceTest() {
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`🚀 SIMULTANEOUS DEVICE TEST - ${timestamp}`);
  console.log('==========================================');
  console.log('Sending identical messages from all 3 devices');
  console.log('');
  
  try {
    // Send from all devices simultaneously
    const promises = [
      sendAndTrack('JON', credentials.jon, 'A'),
      sendAndTrack('SEAN', credentials.sean, 'B'), 
      sendAndTrack('JOSE', credentials.jose, 'C')
    ];

    console.log('📤 Sending messages from all devices...');
    console.log('');
    
    const results = await Promise.allSettled(promises);
    
    setTimeout(() => {
      console.log('');
      console.log('🔍 FINAL ANALYSIS');
      console.log('==================');
      console.log('');
      console.log('📱 CHECK YOUR PHONE NOW!');
      console.log('How many messages did you receive?');
      console.log('');
      console.log('Expected pattern if device-specific:');
      console.log('- Jon\'s message: SHOULD arrive ✅');
      console.log('- Sean\'s message: SHOULD NOT arrive ❌');
      console.log('- Jose\'s message: SHOULD NOT arrive ❌');
      console.log('');
      console.log('All 3 devices will show "Sent" status in API');
      console.log('But only Jon\'s should actually deliver to your phone');
      console.log('');
      console.log('🎯 This proves it\'s DEVICE-SPECIFIC, not hashing!');
      console.log('');
      
      results.forEach((result, index) => {
        const names = ['JON', 'SEAN', 'JOSE'];
        if (result.status === 'fulfilled') {
          const data = result.value;
          console.log(`${names[index]}: ${data.status} | Hash: ${data.isHashed} | Phone: ${data.phone}`);
        } else {
          console.log(`${names[index]}: FAILED - ${result.reason.message}`);
        }
      });
      
      console.log('');
      console.log('💡 NEXT STEPS:');
      console.log('==============');
      console.log('1. Count actual messages received on your phone');
      console.log('2. If only Jon\'s arrives: It\'s Samsung vs Motorola issue');
      console.log('3. If multiple arrive: There\'s another factor');
      console.log('4. If none arrive: All devices broken (unlikely)');
      
    }, 20000);
    
  } catch (error) {
    console.log('❌ Device test failed:', error.message);
  }
}

runDeviceTest(); 