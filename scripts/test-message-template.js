require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test sending personalized messages with template variables
async function testTemplateMessages() {
  try {
    const baseURL = 'http://localhost:3002/api/twilio';
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '14176297373';
    
    console.log('Testing Personalized Messages with Templates');
    
    // Create sample message with template variables
    const messageTemplate = "Hello {name} from {company}! We're reaching out to you on {date} at {time}. Your phone is {phone}.";
    
    console.log(`\nMessage template: "${messageTemplate}"`);
    
    // Create sample contact data
    const messages = [
      {
        phone: testPhoneNumber,
        message: messageTemplate
          .replace(/{name}/g, "John Doe")
          .replace(/{company}/g, "Test Company")
          .replace(/{phone}/g, testPhoneNumber)
          .replace(/{date}/g, new Date().toLocaleDateString())
          .replace(/{time}/g, new Date().toLocaleTimeString())
      }
    ];
    
    console.log('\nPersonalized message:');
    console.log(messages[0].message);
    
    // Uncomment this to actually send the message
    /*
    console.log('\nSending message...');
    const response = await axios.post(`${baseURL}/send-sms`, {
      messages: messages
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    */
    
    console.log('\nTest completed successfully! (Message not actually sent)');
    console.log('To send the message, uncomment the relevant code in the script.');
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testTemplateMessages(); 