// Using built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// Matt's SMSMobileAPI credentials with OAuth
const credentials = {
  apiKey: '82e170293bbfde66347f20e32823c343449ec96f0dd003a0',
  clientId: 'c823503375a74a2f2bb767ba658f407f',
  clientSecret: 'a790fa7aeb3cce1aec549401afd58efb3f6cc7bfefc8f7ae803b4d1132456ab0',
  provider: 'smsmobile'
};

async function testSMSSend() {
  // Try different phone number formats
  const phoneNumber = '+14176297373';  // Add + prefix
  const message = 'Test SMS from TRD System - SMSMobileAPI OAuth Integration Working! 🚀';

  console.log('🔄 Testing SMSMobileAPI connection...');
  console.log(`📱 Sending to: ${phoneNumber}`);
  console.log(`💬 Message: ${message}`);
  console.log('---');

  try {
    // Based on SMSMobileAPI documentation, try the correct endpoints
    console.log('🌐 Making API request to SMSMobileAPI...');
    
    // Format 1: Try the documented endpoint with form data
    console.log('🔄 Trying POST to /sendsms/...');
    
    const formData = new URLSearchParams();
    formData.append('recipients', phoneNumber);
    formData.append('message', message);
    formData.append('apikey', credentials.apiKey);
    
         const headers = {
       'Content-Type': 'application/x-www-form-urlencoded'
     };
     
     // Use access token if available, otherwise use API key + OAuth headers
     if (credentials.accessToken) {
       headers['Authorization'] = `Bearer ${credentials.accessToken}`;
     } else {
       headers['Authorization'] = `Bearer ${credentials.apiKey}`;
       headers['X-Client-ID'] = credentials.clientId;
       headers['X-Client-Secret'] = credentials.clientSecret;
     }
     
     let response = await fetch('https://api.smsmobileapi.com/sendsms/', {
       method: 'POST',
       headers: headers,
       body: formData
     });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', [...response.headers.entries()]);

    // Handle both JSON and text responses
    const responseText = await response.text();
    console.log('📝 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { raw: responseText };
    }

    if (response.ok || responseText.includes('success') || responseText.includes('sent') || responseText.includes('OK')) {
      console.log('✅ SMS sent successfully!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
      if (result.messageId || result.guid) {
        console.log(`📨 Message ID: ${result.messageId || result.guid}`);
      }
      
      console.log('💰 Check your phone for the test message!');
      
    } else {
      console.log('❌ SMS send failed');
      console.log('📋 Error Response:', JSON.stringify(result, null, 2));
      console.log('🔍 Status:', response.status);
      console.log('🔍 Response Text:', responseText);
    }

  } catch (error) {
    console.error('💥 Script Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Network error - check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Request timeout - API may be slow');
    }
  }
}

// Test OAuth token generation first
async function testOAuthToken() {
  console.log('🔐 Testing OAuth token generation...');
  
  try {
    const tokenData = new URLSearchParams();
    tokenData.append('grant_type', 'client_credentials');
    tokenData.append('client_id', credentials.clientId);
    tokenData.append('client_secret', credentials.clientSecret);
    
    const response = await fetch('https://api.smsmobileapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenData
    });
    
    const responseText = await response.text();
    console.log('📝 OAuth response:', responseText.substring(0, 200));
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        if (result.access_token) {
          console.log('✅ OAuth token generated successfully!');
          console.log(`🔑 Access token: ${result.access_token.substring(0, 20)}...`);
          return result.access_token;
        }
      } catch (e) {
        console.log('⚠️ OAuth response not JSON format');
      }
    }
    
    return null;

  } catch (error) {
    console.error('💥 OAuth test error:', error.message);
    return null;
  }
}

// Run the test
async function runTest() {
  console.log('🚀 TRD SMS Test Script');
  console.log('📡 Provider: SMSMobileAPI');
  console.log('🔐 OAuth Authentication: Enabled');
  console.log('═══════════════════════════════════');

  // First test OAuth token generation
  const accessToken = await testOAuthToken();
  
  if (accessToken) {
    console.log('✅ OAuth working, now testing SMS with access token...');
    // Update credentials with the new access token
    credentials.accessToken = accessToken;
    await testSMSSend();
  } else {
    console.log('⚠️ OAuth failed, testing SMS with API key only...');
    await testSMSSend();
  }
  
  console.log('═══════════════════════════════════');
  console.log('🏁 Test completed!');
}

runTest(); 