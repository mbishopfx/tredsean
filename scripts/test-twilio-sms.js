// Simple script to test Twilio SMS functionality
require('dotenv').config({ path: '.env.local' });
const twilio = require('twilio');

// Check if environment variables are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('ERROR: Missing required environment variables. Make sure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set in .env.local');
  process.exit(1);
}

// Create Twilio client
const client = new twilio(accountSid, authToken);

// Define target phone number (modify this for testing)
const testPhoneNumber = process.argv[2];
if (!testPhoneNumber) {
  console.error('ERROR: Please provide a phone number to send the test message to');
  console.error('Usage: node scripts/test-twilio-sms.js +1234567890');
  process.exit(1);
}

// Send a test message
async function sendTestMessage() {
  try {
    console.log(`Sending test message to ${testPhoneNumber} from ${twilioPhoneNumber}`);
    
    const message = await client.messages.create({
      body: 'This is a test message from TRD Dialer & SMS app',
      from: twilioPhoneNumber,
      to: testPhoneNumber
    });
    
    console.log('Message sent successfully!');
    console.log(`SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`Price: ${message.price}`);
  } catch (error) {
    console.error('ERROR: Failed to send message');
    console.error(error);
  }
}

sendTestMessage(); 