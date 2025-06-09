// Using built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// SMS Dove credentials - based on official API documentation
const credentials = {
  token: '121928d86e548ae2ad85b3302a8ba6d3', // Your authorization token
  accountId: '2317', // Your SMS Dove Account ID
  provider: 'smsdove'
};

async function testSMSDoveSend() {
  const phoneNumber = '14176297373';
  const message = 'Test SMS from TRD System - SMS Dove API Integration Working! 🚀';

  console.log('🔄 Testing SMS Dove API connection...');
  console.log(`📱 Sending to: ${phoneNumber}`);
  console.log(`💬 Message: ${message}`);
  console.log('---');

  try {
    console.log('🌐 Making API request to SMS Dove...');
    
    // SMS Dove API format based on official documentation
    const requestBody = {
      To: phoneNumber,
      Msg: message
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `token ${credentials.token}`
    };

    const endpoint = `https://api.smsdove.com/v1/account/${credentials.accountId}/sms`;
    
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🔐 Headers:', { ...headers, Authorization: 'token [HIDDEN]' });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    // Handle response
    const responseText = await response.text();
    console.log('📝 Raw response:', responseText);
    console.log('🔍 Status:', response.status);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { raw: responseText };
    }

    if (response.status === 201) {
      console.log('✅ SMS sent successfully!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
      if (result.Id) {
        console.log(`📨 SMS ID: ${result.Id}`);
      }
      
      console.log('💰 Check your phone for the test message!');
      console.log('🔗 Location header:', response.headers.get('Location'));
      
    } else {
      console.log('❌ SMS send failed');
      console.log('📋 Error Response:', JSON.stringify(result, null, 2));
      console.log('🔍 Status:', response.status);
      
      if (response.status === 401) {
        console.log('🚫 Authentication failed - check your token');
      } else if (response.status === 404) {
        console.log('🚫 Account not found - check your accountId');
      }
    }

  } catch (error) {
    console.error('💥 SMS send error:', error.message);
  }
}

async function main() {
  console.log('🚀 SMS Dove API Test Script');
  console.log('============================');
  
  // Check if credentials are configured
  if (credentials.accountId === 'YOUR_ACCOUNT_ID') {
    console.log('⚠️  Please configure your SMS Dove Account ID first!');
    console.log('');
    console.log('📖 Steps to get your SMS Dove Account ID:');
    console.log('1. Go to https://api.smsdove.com/ or your SMS Dove dashboard');
    console.log('2. Look for your Account ID in the dashboard');
    console.log('3. Update the accountId in this script');
    console.log('');
    console.log('🔑 Your token is already configured: 121928d86e548ae2ad85b3302a8ba6d3');
    console.log('');
    console.log('📱 For Device Callback URL setup:');
    console.log('   - You can leave it as "Not set" for now');
    console.log('   - Later, you can set it to: https://yourdomain.com/api/sms-callbacks');
    console.log('   - This is for receiving delivery status updates');
    return;
  }
  
  await testSMSDoveSend();
}

main().catch(console.error); 