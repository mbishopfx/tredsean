const https = require('https');
const fs = require('fs');

console.log('🚀 MASS TEXT CSV TEST - Jon\'s Working Device Only');
console.log('=================================================');
console.log('📱 Using ONLY Jon\'s confirmed working SMS Gateway');
console.log('🔑 Credentials: AD2XA0:2nitkjiqnmrrtc');
console.log('📡 Endpoint: /3rdparty/v1');
console.log('✨ Testing variable feature with {name}');
console.log('');

// Jon's working credentials (ONLY working device)
const jonCredentials = 'AD2XA0:2nitkjiqnmrrtc';

// Message template as requested
const messageTemplate = 'Testing mass text {name} and this way we can test the variable feature too.';

// Function to read and parse CSV
function readContactsFromCSV(filename) {
  try {
    const csvContent = fs.readFileSync(filename, 'utf8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const contact = {};
      headers.forEach((header, index) => {
        contact[header.trim()] = values[index] ? values[index].trim() : '';
      });
      contacts.push(contact);
    }
    
    return contacts;
  } catch (error) {
    console.log('❌ Error reading CSV:', error.message);
    return [];
  }
}

// Function to clean phone number
function cleanPhoneNumber(phone) {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +1 for US numbers
  if (!cleaned.startsWith('+')) {
    cleaned = '+1' + cleaned;
  }
  
  return cleaned;
}

// Function to personalize message
function personalizeMessage(template, contact) {
  return template.replace(/{name}/g, contact.Name || 'Friend');
}

// Function to send message to one contact
function sendToContact(contact) {
  return new Promise((resolve, reject) => {
    const personalizedMessage = personalizeMessage(messageTemplate, contact);
    const cleanedPhone = cleanPhoneNumber(contact.Phone);
    
    console.log(`📤 Sending to ${contact.Name} (${cleanedPhone}):`);
    console.log(`💬 Message: "${personalizedMessage}"`);
    console.log('');
    
    const data = JSON.stringify({
      message: personalizedMessage,
      phoneNumbers: [cleanedPhone]
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
        console.log(`📊 ${contact.Name} Response Status: ${res.statusCode}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ SUCCESS for ${contact.Name}!`);
            console.log(`📬 Message ID: ${parsed.id}`);
            console.log(`📱 State: ${parsed.state}`);
            console.log(`🔒 IsHashed: ${parsed.isHashed}`);
            console.log(`📞 Phone sent to: ${parsed.phoneNumber || cleanedPhone}`);
            
            resolve({
              contact: contact,
              success: true,
              messageId: parsed.id,
              response: parsed
            });
          } catch (e) {
            console.log(`✅ Message sent to ${contact.Name} (could not parse response)`);
            resolve({
              contact: contact,
              success: true,
              messageId: 'unknown',
              response: responseData
            });
          }
        } else {
          console.log(`❌ Failed for ${contact.Name} with status ${res.statusCode}`);
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
      console.log(`❌ Request failed for ${contact.Name}: ${error.message}`);
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

// Main function to run mass messaging test
async function runMassMessagingTest() {
  try {
    console.log('📋 Reading contacts from mass-text-test.csv...');
    const contacts = readContactsFromCSV('mass-text-test.csv');
    
    if (contacts.length === 0) {
      console.log('❌ No contacts found in CSV file');
      return;
    }
    
    console.log(`📱 Found ${contacts.length} contacts:`);
    contacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.Name}: ${contact.Phone}`);
    });
    console.log('');
    
    console.log('🚀 Starting mass messaging test with Jon\'s device...');
    console.log('');
    
    const results = [];
    
    // Send messages sequentially with delay
    for (const contact of contacts) {
      try {
        const result = await sendToContact(contact);
        results.push(result);
        
        // Add delay between messages to avoid rate limiting
        if (contact !== contacts[contacts.length - 1]) {
          console.log('⏱️  Waiting 3 seconds before next message...');
          await new Promise(resolve => setTimeout(resolve, 3000));
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
        console.log(`${index + 1}. ✅ ${result.contact.Name} (${cleanPhoneNumber(result.contact.Phone)}) - ID: ${result.messageId}`);
      } else {
        console.log(`${index + 1}. ❌ ${result.contact.Name} (${cleanPhoneNumber(result.contact.Phone)}) - Error: ${result.error}`);
      }
    });
    
    console.log('');
    console.log('📱 CHECK YOUR PHONES NOW!');
    console.log('📞 You should receive: "Testing mass text Matt and this way we can test the variable feature too."');
    console.log('📞 Second number should receive: "Testing mass text Contact and this way we can test the variable feature too."');
    console.log('🎯 If both arrive, mass messaging with CSV and variables is working perfectly!');
    
  } catch (error) {
    console.log('❌ Mass messaging test failed:', error.message);
  }
}

runMassMessagingTest(); 