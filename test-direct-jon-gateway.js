// Direct test of Jon's SMS Gateway
const https = require('https');

const data = JSON.stringify({
  message: 'Direct test - ' + new Date().toLocaleTimeString(),
  phoneNumbers: ['+14176297373']
});

const options = {
  hostname: 'api.sms-gate.app',
  port: 443,
  path: '/3rdparty/v1/message',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('AD2XA0:2nitkjiqnmrrtc').toString('base64'),
    'Content-Length': data.length
  }
};

console.log('🧪 Testing Jon\'s SMS Gateway directly...');
console.log('📋 Request data:', data);

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('📊 Status:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    console.log('📄 Body:', responseData);
    console.log('📄 Body length:', responseData.length);
    
    if (responseData.trim() === '') {
      console.log('⚠️ EMPTY RESPONSE BODY!');
    }
    
    try {
      const parsed = JSON.parse(responseData);
      console.log('✅ Valid JSON:', parsed);
    } catch (e) {
      console.log('❌ Invalid JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
});

req.write(data);
req.end(); 