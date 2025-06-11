// Use built-in fetch for Node 18+ or fallback to curl
const fetch = globalThis.fetch || require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://tredsean.vercel.app', // Update if different
  singleTestMessage: "Single message test",
  massTestMessage: "This is a test for mass system {name}",
  mattPhone: "+14176297373", // Update with your actual number
  credentials: {
    provider: "personal",
    email: "sean@trurankdigital.com",
    password: "Croatia5376!",
    cloudUsername: "AUZNLR",
    cloudPassword: "mpx-bhqzhm8bvg"
  }
};

async function testSingleMessage() {
  console.log("\n🧪 Testing Single Message...");
  console.log(`Sending to: ${TEST_CONFIG.mattPhone}`);
  console.log(`Message: "${TEST_CONFIG.singleTestMessage}"`);
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumbers: [TEST_CONFIG.mattPhone],
        message: TEST_CONFIG.singleTestMessage,
        provider: 'personal',
        credentials: TEST_CONFIG.credentials,
        campaignId: `single_test_${Date.now()}`
      }),
    });

    const result = await response.json();
    console.log("✅ Single Message Response:", JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log("✅ Single message API call successful");
    } else {
      console.log("❌ Single message API call failed");
    }
    
    return response.ok;
  } catch (error) {
    console.error("❌ Single message test error:", error);
    return false;
  }
}

async function testSMSGatewayDirectly() {
  console.log("\n🔧 Testing SMS Gateway API Directly...");
  
  try {
    // Test the direct SMS Gateway endpoint
    const response = await fetch('https://smsgateway.me/api/v4/message/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from('AUZNLR:mpx-bhqzhm8bvg').toString('base64')}`
      },
      body: JSON.stringify({
        message: "Direct API test message",
        phoneNumbers: [TEST_CONFIG.mattPhone]
      }),
    });

    const result = await response.json();
    console.log("📡 Direct SMS Gateway Response:", JSON.stringify(result, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error("❌ Direct SMS Gateway test error:", error);
    return false;
  }
}

async function checkSMSGatewayStatus() {
  console.log("\n📊 Checking SMS Gateway Status...");
  
  try {
    const response = await fetch('https://smsgateway.me/api/v4/device', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from('AUZNLR:mpx-bhqzhm8bvg').toString('base64')}`
      },
    });

    const result = await response.json();
    console.log("📱 SMS Gateway Device Status:", JSON.stringify(result, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error("❌ SMS Gateway status check error:", error);
    return false;
  }
}

async function runTroubleshootingTests() {
  console.log("🚀 Starting SMS Troubleshooting Tests...");
  console.log("=" * 50);
  
  // Test 1: Check SMS Gateway status
  const statusOk = await checkSMSGatewayStatus();
  
  // Test 2: Test direct SMS Gateway API
  const directApiOk = await testSMSGatewayDirectly();
  
  // Test 3: Test our single message endpoint
  const singleMessageOk = await testSingleMessage();
  
  console.log("\n📋 TROUBLESHOOTING SUMMARY:");
  console.log("=" * 30);
  console.log(`SMS Gateway Status: ${statusOk ? '✅' : '❌'}`);
  console.log(`Direct API Test: ${directApiOk ? '✅' : '❌'}`);
  console.log(`Single Message Test: ${singleMessageOk ? '✅' : '❌'}`);
  
  if (!statusOk) {
    console.log("\n🔴 ISSUE: SMS Gateway device appears to be offline or unreachable");
    console.log("💡 SOLUTION: Check Sean's phone - SMS Gateway app needs to be:");
    console.log("   - Running and online");
    console.log("   - Connected to internet");
    console.log("   - Cloud server enabled");
  }
  
  if (!directApiOk) {
    console.log("\n🔴 ISSUE: Direct SMS Gateway API calls are failing");
    console.log("💡 SOLUTION: Credentials may be invalid or API endpoint changed");
  }
  
  if (!singleMessageOk) {
    console.log("\n🔴 ISSUE: Our SMS API endpoint is failing");
    console.log("💡 SOLUTION: Check application logs and API implementation");
  }
  
  if (statusOk && directApiOk && singleMessageOk) {
    console.log("\n✅ All tests passed! SMS system appears to be working.");
    console.log("🤔 If messages still aren't being received, the issue might be:");
    console.log("   - Phone number formatting");
    console.log("   - Carrier blocking");
    console.log("   - SMS Gateway app settings on Sean's phone");
  }
}

// Run the tests
runTroubleshootingTests().catch(console.error); 