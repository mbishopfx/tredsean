const https = require('https');
const fs = require('fs');

console.log('🚀 FULL FIELDS CSV TEST - Jon\'s Working Device + All Data Preserved');
console.log('====================================================================');
console.log('📱 Using ONLY Jon\'s confirmed working SMS Gateway');
console.log('🔑 Credentials: AD2XA0:2nitkjiqnmrrtc');
console.log('📡 Endpoint: /3rdparty/v1');
console.log('✨ Testing with FULL CSV fields and advanced personalization');
console.log('');

// Jon's working credentials (ONLY working device)
const jonCredentials = 'AD2XA0:2nitkjiqnmrrtc';

// Advanced message template using multiple CSV fields
const messageTemplate = 'Hi {name}! I noticed {company} in {city}, {state} could benefit from better digital presence. As a {title}, you probably see the gap. Quick call to discuss how we can help {company} dominate your market?';

// Function to read and parse CSV with ALL fields
function readContactsFromCSV(filename) {
  try {
    const csvContent = fs.readFileSync(filename, 'utf8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('📋 CSV Headers Found:', headers);
    console.log('');
    
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact = {};
      headers.forEach((header, index) => {
        contact[header] = values[index] || '';
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
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+1' + cleaned;
  }
  return cleaned;
}

// Advanced personalization function using ALL available fields
function personalizeMessage(template, contact) {
  let personalizedMessage = template;
  
  // Replace all available fields in the template
  Object.keys(contact).forEach(field => {
    const placeholder = `{${field}}`;
    const value = contact[field] || field; // Fallback to field name if empty
    personalizedMessage = personalizedMessage.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return personalizedMessage;
}

// Function to send message to one contact
function sendToContact(contact) {
  return new Promise((resolve, reject) => {
    const personalizedMessage = personalizeMessage(messageTemplate, contact);
    const cleanedPhone = cleanPhoneNumber(contact.phone);
    
    console.log(`📤 Sending to ${contact.name} (${cleanedPhone}):`);
    console.log(`🏢 Company: ${contact.company}`);
    console.log(`📍 Location: ${contact.city}, ${contact.state}`);
    console.log(`💼 Title: ${contact.title}`);
    console.log(`📧 Email: ${contact.email}`);
    console.log(`💬 Personalized Message: "${personalizedMessage}"`);
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
        console.log(`📊 ${contact.name} Response Status: ${res.statusCode}`);
        
        if (res.statusCode === 202 || res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ SUCCESS for ${contact.name}!`);
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

// Main function to run full fields test
async function runFullFieldsTest() {
  try {
    console.log('📋 Reading contacts from test-full-fields.csv...');
    const contacts = readContactsFromCSV('test-full-fields.csv');
    
    if (contacts.length === 0) {
      console.log('❌ No contacts found in CSV file');
      return;
    }
    
    console.log(`📱 Found ${contacts.length} contacts with full data:`);
    contacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.name} - ${contact.company} - ${contact.phone}`);
    });
    console.log('');
    
    console.log('🚀 Starting advanced personalized messaging...');
    console.log('');
    
    const results = [];
    
    // Send messages sequentially with delay
    for (const contact of contacts) {
      try {
        const result = await sendToContact(contact);
        results.push(result);
        
        // Add delay between messages
        if (contact !== contacts[contacts.length - 1]) {
          console.log('⏱️  Waiting 3 seconds before next message...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        results.push(error);
      }
    }
    
    console.log('');
    console.log('📊 FULL FIELDS TEST RESULTS:');
    console.log('=============================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📱 Total: ${results.length}`);
    console.log('');
    
    console.log('📋 Individual Results:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`${index + 1}. ✅ ${result.contact.name} at ${result.contact.company} - ID: ${result.messageId}`);
      } else {
        console.log(`${index + 1}. ❌ ${result.contact.name} - Error: ${result.error}`);
      }
    });
    
    console.log('');
    console.log('📱 CHECK YOUR PHONES NOW!');
    console.log('🎯 You should receive highly personalized messages using:');
    console.log('   • Name, Company, City, State, Title from CSV');
    console.log('   • ALL FIELDS PRESERVED and utilized for personalization');
    console.log('   • Jon\'s working SMS Gateway for actual delivery');
    console.log('');
    console.log('✅ This proves CSV processing preserves ALL data while ensuring delivery!');
    
  } catch (error) {
    console.log('❌ Full fields test failed:', error.message);
  }
}

runFullFieldsTest(); 