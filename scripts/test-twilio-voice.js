// Simple script to test Twilio Voice functionality
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
  console.error('ERROR: Please provide a phone number to call');
  console.error('Usage: node scripts/test-twilio-voice.js +1234567890');
  process.exit(1);
}

// Make a test call
async function makeTestCall() {
  try {
    console.log(`Initiating test call to ${testPhoneNumber} from ${twilioPhoneNumber}`);
    
    // Create a TwiML URL for testing
    // In production, you'd use a proper URL to your TwiML endpoint
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">This is a test call from TRD Dialer. Thank you for testing!</Say>
  <Pause length="1"/>
  <Say voice="alice">Goodbye!</Say>
</Response>`;
    
    // For testing purposes, we'll use a TwiML bin URL or a publicly accessible URL
    // You can create a TwiML bin in your Twilio console
    const call = await client.calls.create({
      twiml: twiml,
      to: testPhoneNumber,
      from: twilioPhoneNumber
    });
    
    console.log('Call initiated successfully!');
    console.log(`SID: ${call.sid}`);
    console.log(`Status: ${call.status}`);
    
    // Note: Call status will likely be "queued" initially
    // To get final status, you'd need to poll the API or use webhooks
  } catch (error) {
    console.error('ERROR: Failed to initiate call');
    console.error(error);
  }
}

makeTestCall(); 