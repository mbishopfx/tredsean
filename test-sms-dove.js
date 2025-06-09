// Using built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// SMS Dove credentials - You'll need to get these from SMS Dove
const credentials = {
  deviceId: 'YOUR_DEVICE_ID', // Get this from SMS Dove app after installation
  accessCode: 'YOUR_ACCESS_CODE', // Get this from SMS Dove app
  provider: 'smsdove'
};

async function testSMSDoveSend() {
  const phoneNumber = '14176297373';
  const message = 'Test SMS from TRD System - SMS Dove Integration Working! 🚀';

  console.log('🔄 Testing SMS Dove connection...');
  console.log(`📱 Sending to: ${phoneNumber}`);
  console.log(`💬 Message: ${message}`);
  console.log('---');

  try {
    console.log('🌐 Making API request to SMS Dove...');
    
    // SMS Dove API format based on their documentation
    const requestBody = {
      device_id: credentials.deviceId,
      access_code: credentials.accessCode,
      phone: phoneNumber,
      message: message
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://www.smsdove.com/api/send', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    // Handle both JSON and text responses
    const responseText = await response.text();
    console.log('📝 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { raw: responseText };
    }

    if (response.ok || responseText.includes('success') || responseText.includes('sent')) {
      console.log('✅ SMS sent successfully!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
      if (result.messageId || result.id) {
        console.log(`📨 Message ID: ${result.messageId || result.id}`);
      }
      
      console.log('💰 Check your phone for the test message!');
      
    } else {
      console.log('❌ SMS send failed');
      console.log('📋 Error Response:', JSON.stringify(result, null, 2));
      console.log('🔍 Status:', response.status);
    }

  } catch (error) {
    console.error('💥 SMS send error:', error.message);
  }
}

async function main() {
  console.log('🚀 SMS Dove Test Script');
  console.log('============================');
  
  // Check if credentials are configured
  if (credentials.deviceId === 'YOUR_DEVICE_ID' || credentials.accessCode === 'YOUR_ACCESS_CODE') {
    console.log('⚠️  Please configure your SMS Dove credentials first!');
    console.log('');
    console.log('📖 Steps to get your SMS Dove credentials:');
    console.log('1. Go to https://www.smsdove.com/');
    console.log('2. Sign up for an account');
    console.log('3. Download the SMS Dove Android app');
    console.log('4. Install the app on your Android phone');
    console.log('5. In the app settings, enter your Device ID and Access Code');
    console.log('6. Wait for the app to connect to the server successfully');
    console.log('7. Update the credentials in this script');
    console.log('');
    console.log('🔑 You can get up to 2 Device IDs for free!');
    return;
  }
  
  await testSMSDoveSend();
}

main().catch(console.error); 