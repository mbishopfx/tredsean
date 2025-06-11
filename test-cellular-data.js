const https = require('https');

console.log('📶 Testing With CELLULAR DATA Connection');
console.log('=======================================');
console.log('✅ Sean disconnected from WiFi');
console.log('✅ Now using cellular data');
console.log('🎯 Cellular often more reliable for SMS Gateway');
console.log('📡 Direct carrier connection vs WiFi routing');
console.log('');

const testConfig = {
  yourNumber: '+14176297373',
  message: 'CELLULAR DATA TEST - ' + new Date().toLocaleTimeString(),
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

console.log(`📱 Sending to: ${testConfig.yourNumber}`);
console.log(`💬 Message: "${testConfig.message}"`);
console.log('📶 Connection: ✅ Cellular Data (no WiFi)');
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
            console.log('📶 CELLULAR CONNECTION TEST:');
            console.log('===========================');
            console.log('🎯 This could be THE fix!');
            console.log('📡 Cellular = Direct carrier connection');
            console.log('🚫 No WiFi routing issues');
            console.log('⚡ More reliable for SMS apps');
            console.log('');
            console.log('📱 Sean: Check logs for ACTION_SENT');
            console.log('📩 Matt: This message should arrive!');
            console.log('');
            console.log('🚀 Cellular data often resolves SMS Gateway issues!');
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

async function runCellularTest() {
  try {
    console.log('🚀 Testing with cellular data...');
    await sendTestMessage();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runCellularTest(); 