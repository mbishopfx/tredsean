// Using built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// Matt's SMSMobileAPI credentials with OAuth
const credentials = {
  apiKey: '82e170293bbfde66347f20e32823c343449ec96f0dd003a0',
  clientId: 'c823503375a74a2f2bb767ba658f407f',
  clientSecret: 'a790fa7aeb3cce1aec549401afd58efb3f6cc7bfefc8f7ae803b4d1132456ab0',
  provider: 'smsmobile'
};

// Get OAuth token first
async function getOAuthToken() {
  console.log('🔐 Getting OAuth token...');
  
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
    
    const result = await response.json();
    if (result.access_token) {
      console.log('✅ OAuth token obtained');
      return result.access_token;
    }
    
    return null;
  } catch (error) {
    console.error('💥 OAuth error:', error.message);
    return null;
  }
}

// Check SMS log/status
async function checkSMSLog() {
  console.log('📋 Checking SMS sent log...');
  
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) {
      console.log('❌ Could not get access token');
      return;
    }

    // Check sent SMS log
    const response = await fetch('https://api.smsmobileapi.com/log/sent/sms', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('📊 Log response status:', response.status);
    const responseText = await response.text();
    console.log('📝 Raw log response:', responseText);

    if (response.ok) {
      try {
        const logData = JSON.parse(responseText);
        console.log('📋 SMS Log Data:', JSON.stringify(logData, null, 2));
        
        if (logData.list && logData.list.length > 0) {
          console.log(`📨 Found ${logData.list.length} sent messages:`);
          
          logData.list.forEach((msg, index) => {
            console.log(`\n📍 Message ${index + 1}:`);
            console.log(`   ID: ${msg.guid || msg.id}`);
            console.log(`   To: ${msg.recipients || msg.phone}`);
            console.log(`   Status: ${msg.status || 'Unknown'}`);
            console.log(`   Error: ${msg.error || 'None'}`);
            console.log(`   Date: ${msg.date_sent || msg.datetime}`);
            console.log(`   Message: ${msg.message || 'N/A'}`);
          });
        } else {
          console.log('📭 No messages found in log');
        }
        
      } catch (e) {
        console.log('⚠️ Log response not JSON, raw text:', responseText);
      }
    } else {
      console.log('❌ Log request failed');
    }

  } catch (error) {
    console.error('💥 Log check error:', error.message);
  }
}

// Test different phone number formats
async function testPhoneFormats() {
  console.log('📱 Testing different phone number formats...');
  
  const formats = [
    '14176297373',
    '+14176297373', 
    '1-417-629-7373',
    '4176297373'
  ];

  const accessToken = await getOAuthToken();
  if (!accessToken) {
    console.log('❌ Could not get access token for format testing');
    return;
  }

  for (const phoneFormat of formats) {
    console.log(`\n📞 Testing format: ${phoneFormat}`);
    
    try {
      const formData = new URLSearchParams();
      formData.append('recipients', phoneFormat);
      formData.append('message', `Test format: ${phoneFormat} - Time: ${new Date().toISOString()}`);
      formData.append('apikey', credentials.apiKey);
      
      const response = await fetch('https://api.smsmobileapi.com/sendsms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const responseText = await response.text();
      console.log(`   Response: ${responseText.substring(0, 100)}...`);
      
      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          if (result.result && result.result.error === 0) {
            console.log(`   ✅ Format ${phoneFormat} accepted - ID: ${result.result.id}`);
          } else {
            console.log(`   ⚠️ Format ${phoneFormat} - Error: ${result.result?.error || 'Unknown'}`);
          }
        } catch (e) {
          console.log(`   ⚠️ Format ${phoneFormat} - Non-JSON response`);
        }
      } else {
        console.log(`   ❌ Format ${phoneFormat} failed - Status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   💥 Format ${phoneFormat} error: ${error.message}`);
    }
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Run comprehensive diagnostics
async function runDiagnostics() {
  console.log('🚀 SMSMobileAPI Diagnostics');
  console.log('═══════════════════════════════════════');

  // 1. Check SMS log first
  await checkSMSLog();
  
  console.log('\n═══════════════════════════════════════');
  
  // 2. Test different phone formats
  await testPhoneFormats();
  
  console.log('\n═══════════════════════════════════════');
  console.log('🏁 Diagnostics completed!');
  console.log('\n💡 If messages show as sent but not received:');
  console.log('   1. Check if your phone has signal');
  console.log('   2. Check spam/blocked messages');
  console.log('   3. Try a different phone number for testing');
  console.log('   4. Contact SMSMobileAPI support about delivery issues');
}

runDiagnostics(); 