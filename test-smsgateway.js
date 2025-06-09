const API_BASE = 'http://localhost:3000';

// Test SMS Gateway integration
async function testSMSGateway() {
  console.log('🚀 Testing SMS Gateway Integration...\n');
  
  try {
    // Test with temporary credentials (you'll update these after app setup)
    const testCredentials = {
      provider: 'smsgateway',
      username: 'YOUR_USERNAME_FROM_APP', // Replace with actual username from SMS Gateway app
      password: 'YOUR_PASSWORD_FROM_APP', // Replace with actual password from SMS Gateway app
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    };
    
    console.log('Step 1: Testing SMS Gateway connection...');
    
    // Replace with your actual phone number for testing
    const testPhone = '+1234567890'; // CHANGE THIS TO YOUR TEST NUMBER
    const testMessage = 'Hello from TRD SMS system! This is a test message from SMS Gateway (open source).';
    
    const smsResponse = await fetch(`${API_BASE}/api/personal-sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageText: testMessage,
        phoneNumbers: [testPhone],
        credentials: testCredentials
      })
    });
    
    const smsData = await smsResponse.json();
    console.log('SMS Response:', JSON.stringify(smsData, null, 2));
    
    if (smsData.success) {
      console.log('✅ SMS sent successfully!');
      console.log(`📱 Check your phone ${testPhone} for the message`);
    } else {
      console.log('❌ SMS failed:', smsData.error || 'Unknown error');
      
      if (smsData.error && smsData.error.includes('username')) {
        console.log('\n📋 Next Steps:');
        console.log('1. Install SMS Gateway app on your Android phone');
        console.log('2. Get username/password from the app');
        console.log('3. Update the credentials in this test script');
        console.log('4. Run the test again');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Also test authentication to make sure SMS Gateway is properly configured
async function testAuth() {
  console.log('\n🔐 Testing authentication...');
  
  try {
    const authResponse = await fetch(`${API_BASE}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Matttrd',
        password: 'admin123!',
        type: 'team'
      })
    });
    
    const authData = await authResponse.json();
    console.log('Auth Response:', authData);
    
    if (authData.success) {
      console.log('✅ Authentication successful');
      console.log('SMS Provider:', authData.userInfo.personalSMS.provider);
    } else {
      console.log('❌ Authentication failed');
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
  }
}

// Run both tests
async function runAllTests() {
  await testAuth();
  await testSMSGateway();
}

runAllTests(); 