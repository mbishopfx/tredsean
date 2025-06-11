const https = require('https');

console.log('🚀 MASS MESSAGING TEST - Jon\'s Working Device');
console.log('=============================================');
console.log('📱 Using Jon\'s confirmed working SMS Gateway');
console.log('🔑 Credentials: AD2XA0:2nitkjiqnmrrtc');
console.log('📡 Endpoint: /3rdparty/v1');
console.log('✨ Testing personalization with {name}');
console.log('');

// Test contacts with personalization
const contacts = [
  {
    name: 'Matt',
    phone: '+14176297373'
  },
  {
    name: 'Sean', 
    phone: '+16467705587'  // Sean's number from previous tests
  }
];

// Message template with {name} personalization
const messageTemplate = 'Hi {name}! This is a MASS MESSAGING TEST from Jon\'s working SMS Gateway device. Time: {time}. If you got this, the mass messaging is working perfectly! 🎉';

console.log('📋 Test Contacts:');
contacts.forEach((contact, index) => {
  console.log(`${index + 1}. ${contact.name}: ${contact.phone}`);
});
console.log('');

// Jon's working credentials
const jonCredentials = 'AD2XA0:2nitkjiqnmrrtc';

// Function to personalize message
function personalizeMessage(template, contact) {
  return template
    .replace(/{name}/g, contact.name)
    .replace(/{time}/g, new Date().toLocaleTimeString());
}

// Function to send message to one contact
function sendToContact(contact) {
  return new Promise((resolve, reject) => {
    const personalizedMessage = personalizeMessage(messageTemplate, contact);
    
    console.log(`📤 Sending to ${contact.name} (${contact.phone}):`);
    console.log(`💬 Message: "${personalizedMessage}"`);
    console.log('');
    
    const data = JSON.stringify({
      message: personalizedMessage,
      phoneNumbers: [contact.phone]
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
        console.log(`📊 ${contact.name} Response Status: ${res.statusCode}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ SUCCESS for ${contact.name}!`);
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 State: ${parsed.state}`);
            console.log(`🔒 IsHashed: ${parsed.isHashed}`);
            
            resolve({
              contact: contact,
              success: true,
              messageId: parsed.id,
              response: parsed
            });
          } catch (e) {
            console.log(`✅ Message sent to ${contact.name} (could not parse response)`);
            resolve({
              contact: contact,
              success: true,
              messageId: 'unknown',
              response: responseData
            });
          }
        } else {
          console.log(`❌ Failed for ${contact.name} with status ${res.statusCode}`);
          console.log(`📋 Response: ${responseData}`);
          
          reject({
            contact: contact,
            success: false,
            error: `HTTP ${res.statusCode}: ${responseData}`
          });
        }
        console.log('---');
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed for ${contact.name}: ${error.message}`);
      reject({
        contact: contact,
        success: false,
        error: error.message
      });
    });

    req.write(data);
    req.end();
  });
}

// Main function to send to all contacts
async function runMassMessagingTest() {
  try {
    console.log('🚀 Starting mass messaging test...');
    console.log('');
    
    const results = [];
    
    // Send messages sequentially with delay
    for (const contact of contacts) {
      try {
        const result = await sendToContact(contact);
        results.push(result);
        
        // Add delay between messages to avoid rate limiting
        if (contact !== contacts[contacts.length - 1]) {
          console.log('⏱️  Waiting 2 seconds before next message...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        results.push(error);
      }
    }
    
    console.log('');
    console.log('📊 MASS MESSAGING TEST RESULTS:');
    console.log('================================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📱 Total: ${results.length}`);
    console.log('');
    
    console.log('📋 Individual Results:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`${index + 1}. ✅ ${result.contact.name} (${result.contact.phone}) - ID: ${result.messageId}`);
      } else {
        console.log(`${index + 1}. ❌ ${result.contact.name} (${result.contact.phone}) - Error: ${result.error}`);
      }
    });
    
    console.log('');
    console.log('📱 CHECK YOUR PHONES NOW!');
    console.log('Both Matt and Sean should receive personalized messages');
    console.log('🎯 If both arrive, mass messaging is working perfectly!');
    
  } catch (error) {
    console.log('❌ Mass messaging test failed:', error.message);
  }
}

runMassMessagingTest(); 