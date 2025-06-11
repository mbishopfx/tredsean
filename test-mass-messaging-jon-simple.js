const https = require('https');

console.log('🚀 MASS MESSAGING TEST - Jon\'s Working Device (Simple)');
console.log('====================================================');

// Test contacts
const contacts = [
  { name: 'Matt', phone: '+14176297373' },
  { name: 'Sean', phone: '+16467705587' }
];

// Shorter message template to avoid JSON issues
const messageTemplate = 'Hi {name}! Mass test from Jon. Time: {time}';

console.log('📋 Test Contacts:');
contacts.forEach((contact, index) => {
  console.log(`${index + 1}. ${contact.name}: ${contact.phone}`);
});
console.log('');

const jonCredentials = 'AD2XA0:2nitkjiqnmrrtc';

function personalizeMessage(template, contact) {
  return template
    .replace(/{name}/g, contact.name)
    .replace(/{time}/g, new Date().toLocaleTimeString());
}

async function sendToContact(contact) {
  const personalizedMessage = personalizeMessage(messageTemplate, contact);
  
  console.log(`📤 Sending to ${contact.name}:`);
  console.log(`💬 "${personalizedMessage}"`);
  
  const data = JSON.stringify({
    message: personalizedMessage,
    phoneNumbers: [contact.phone]
  });

  return new Promise((resolve, reject) => {
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
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`📊 ${contact.name}: ${res.statusCode}`);
        if (res.statusCode === 202 || res.statusCode === 200) {
          const parsed = JSON.parse(responseData);
          console.log(`✅ ${contact.name} SUCCESS! ID: ${parsed.id}`);
          resolve({ contact, success: true, messageId: parsed.id });
        } else {
          console.log(`❌ ${contact.name} failed: ${responseData}`);
          reject({ contact, success: false, error: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${contact.name} error: ${error.message}`);
      reject({ contact, success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Starting simplified mass test...');
  
  const results = [];
  
  for (const contact of contacts) {
    try {
      const result = await sendToContact(contact);
      results.push(result);
      
      if (contact !== contacts[contacts.length - 1]) {
        console.log('⏱️  Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.push(error);
    }
  }
  
  console.log('');
  console.log('📊 RESULTS:');
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Success: ${successful}/${results.length}`);
  console.log('📱 Check your phones for personalized messages!');
}

runTest(); 