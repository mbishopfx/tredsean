const https = require('https');

console.log('🔄 Testing After FORCE STOP + Restart');
console.log('=====================================');
console.log('✅ Sean did FORCE STOP (complete app termination)');
console.log('✅ App restarted fresh from force stop');
console.log('🎯 Force stop can clear deeper Android issues');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'FORCE STOP TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('🔄 After: Force stop + fresh restart');
console.log('');

function sendTestMessage() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: testConfig.message,
      phoneNumbers: [testConfig.yourNumber]
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
        console.log(`📊 API Response: ${res.statusCode}`);
        console.log(`📋 Response Data: ${responseData}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ Message queued: ${parsed.id}`);
            console.log('');
            console.log('🎯 FORCE STOP TEST:');
            console.log('==================');
            console.log('🔄 Force stop clears: Memory, cache, connections');
            console.log('🔄 Fresh restart rebuilds: SMS integration');
            console.log('📱 Sean: Check message appears as "sent"');
            console.log('📩 Matt: Check if you receive this message');
            console.log('');
            console.log('💡 Force stop often fixes Android integration issues!');
            resolve(parsed);
          } catch (e) {
            console.log(`✅ Message sent (could not parse response)`);
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

async function runForceStopTest() {
  try {
    console.log('🚀 Testing after force stop...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runForceStopTest(); 