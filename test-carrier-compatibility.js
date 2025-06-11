const https = require('https');

console.log('🧪 Testing Carrier Compatibility Issues');
console.log('======================================');

// Test different message formats to see if TracFone filters certain types
const testMessages = [
  'Hi there!', // Simple personal message
  'Test 123', // Very basic
  'This is a test message from a friend', // Personal sounding
  'Hello from SMS system' // More automated sounding
];

const testConfig = {
  tracFoneNumber: '+16467705587', // TracFone number that's not receiving
  seanCredentials: 'AUZNLR:mpx-bhqzhm8bvg'
};

function sendTestMessage(message, messageType) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      phoneNumbers: [testConfig.tracFoneNumber]
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
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ ${messageType}: Queued (ID: ${parsed.id})`);
            resolve(parsed);
          } catch (e) {
            console.log(`✅ ${messageType}: Sent`);
            resolve(responseData);
          }
        } else {
          console.log(`❌ ${messageType}: Failed (${res.statusCode})`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${messageType}: Error - ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runCarrierCompatibilityTest() {
  console.log('🎯 Testing different message types to TracFone...');
  console.log('');
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    const messageType = `Test ${i + 1}`;
    
    console.log(`📤 ${messageType}: "${message}"`);
    
    try {
      await sendTestMessage(message, messageType);
      // Wait 2 seconds between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`❌ ${messageType} failed:`, error.message);
    }
  }
  
  console.log('');
  console.log('🔍 CARRIER COMPATIBILITY DIAGNOSIS:');
  console.log('==================================');
  console.log('📱 Check TracFone device for ANY of these messages');
  console.log('');
  console.log('If NONE arrive:');
  console.log('  🚫 TracFone is likely blocking SMS from Sean\'s carrier/number');
  console.log('  💡 Solution: Try Jose\'s SMS Gateway or different sending number');
  console.log('');
  console.log('If SOME arrive:');
  console.log('  📝 TracFone is filtering based on message content');
  console.log('  💡 Solution: Use more personal-sounding message templates');
  console.log('');
  console.log('If ALL arrive:');
  console.log('  ⏰ There might be delivery delays with TracFone');
  console.log('  💡 Solution: Wait longer for message delivery');
}

runCarrierCompatibilityTest(); 