// Script to send an SMS and track its status
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
  console.error('Usage: node scripts/send-and-track-sms.js +1234567890');
  process.exit(1);
}

// Send a message and track its status
async function sendAndTrackMessage() {
  try {
    console.log(`Sending message to ${testPhoneNumber} from ${twilioPhoneNumber}`);
    console.log('Timestamp:', new Date().toISOString());
    
    // Send the message
    const message = await client.messages.create({
      body: `Test message from TRD Dialer at ${new Date().toLocaleTimeString()}`,
      from: twilioPhoneNumber,
      to: testPhoneNumber
    });
    
    console.log('Message submitted successfully!');
    console.log(`Initial SID: ${message.sid}`);
    console.log(`Initial Status: ${message.status}`);
    console.log('Timestamp:', new Date().toISOString());
    
    // Now check the status repeatedly
    console.log('\nTracking message status:');
    
    let currentStatus = message.status;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (currentStatus !== 'delivered' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
      
      try {
        // Fetch the latest message status
        const updatedMessage = await client.messages(message.sid).fetch();
        
        // Only log if status has changed
        if (updatedMessage.status !== currentStatus) {
          currentStatus = updatedMessage.status;
          console.log(`Status updated (after ${attempts}s): ${currentStatus}`);
          console.log('Timestamp:', new Date().toISOString());
        } else {
          process.stdout.write('.'); // Show activity without spamming
        }
        
        if (currentStatus === 'delivered') {
          console.log('\nMessage delivered successfully!');
          console.log(`Time to delivery: approximately ${attempts} seconds`);
          break;
        }
      } catch (error) {
        console.error(`Error checking status (attempt ${attempts}):`, error.message);
      }
    }
    
    if (currentStatus !== 'delivered') {
      console.log(`\nMessage not confirmed as delivered after ${maxAttempts} seconds.`);
      console.log('Final status:', currentStatus);
      console.log('This does NOT mean the message wasn\'t delivered - just that the status hasn\'t been updated yet.');
    }
    
    console.log('\nNote: Even with a "queued" status, the message is usually delivered within seconds.');
    console.log('The status in Twilio\'s system may just take time to update.');
  } catch (error) {
    console.error('ERROR: Failed to send message');
    console.error(error);
  }
}

sendAndTrackMessage(); 