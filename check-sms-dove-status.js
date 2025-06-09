// Using built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// SMS Dove credentials
const credentials = {
  token: '121928d86e548ae2ad85b3302a8ba6d3',
  accountId: '2317'
};

async function checkSMSStatus() {
  const smsId = '410467'; // The SMS ID from our previous test

  console.log('🔍 Checking SMS Dove message status...');
  console.log(`📨 SMS ID: ${smsId}`);
  console.log('---');

  try {
    const endpoint = `https://api.smsdove.com/v1/account/${credentials.accountId}/sms/${smsId}`;
    
    console.log(`📡 Endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `token ${credentials.token}`
      }
    });

    const responseText = await response.text();
    console.log('📝 Raw response:', responseText);
    console.log('🔍 Status:', response.status);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('📋 SMS Details:', JSON.stringify(result, null, 2));
      
      console.log('---');
      console.log('📊 Status Analysis:');
      console.log(`📱 To: ${result.To}`);
      console.log(`💬 Message: ${result.Msg}`);
      console.log(`🟢 Status: ${result.Status}`);
      console.log(`📅 Created: ${result.Ctime}`);
      
      if (result.ReportTime) {
        console.log(`📊 Report Time: ${result.ReportTime}`);
      }
      
      if (result.ReportMsg) {
        console.log(`⚠️ Report Message: ${result.ReportMsg}`);
      }
      
      if (result.DeviceId) {
        console.log(`📱 Device ID: ${result.DeviceId}`);
      }
      
      // Explain status
      console.log('---');
      console.log('📖 Status Explanation:');
      switch (result.Status) {
        case 'accepted':
          console.log('✅ Message accepted by SMS Dove API');
          break;
        case 'queued':
          console.log('⏳ Message queued, waiting for device to send');
          break;
        case 'sent':
          console.log('🚀 Message successfully sent from device');
          break;
        case 'failed':
          console.log('❌ Message failed to send');
          break;
        default:
          console.log(`❓ Unknown status: ${result.Status}`);
      }
      
    } else {
      console.log('❌ Failed to get SMS status');
      console.log('📋 Error:', responseText);
    }

  } catch (error) {
    console.error('💥 Error checking SMS status:', error.message);
  }
}

async function main() {
  console.log('🚀 SMS Dove Status Checker');
  console.log('============================');
  
  await checkSMSStatus();
}

main().catch(console.error); 