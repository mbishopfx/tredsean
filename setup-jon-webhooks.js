const https = require('https');

console.log('🔗 SETTING UP WEBHOOKS FOR JON\'S DEVICE');
console.log('=======================================');
console.log('📱 Jon\'s Samsung device is working');
console.log('🎯 Setting up webhooks to receive replies');
console.log('');

// Jon's working credentials
const JON_CREDENTIALS = 'AD2XA0:2nitkjiqnmrrtc';

// Your production webhook URL
const WEBHOOK_URL = 'https://smsdialer.vercel.app/api/sms-gateway/webhook';

// Function to make API requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const responseData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

async function setupJonWebhooks() {
  try {
    console.log('🔍 Step 1: Checking current webhook configuration...');
    
    // Check current webhooks
    const checkResponse = await makeRequest('https://api.sms-gate.app/3rdparty/v1/webhooks');
    
    if (checkResponse.status === 200) {
      console.log('✅ Current webhook configuration:');
      console.log(JSON.stringify(checkResponse.data, null, 2));
    } else {
      console.log(`⚠️ Could not retrieve webhook config (${checkResponse.status}):`, checkResponse.data);
    }

    console.log('');
    console.log('🔧 Step 2: Setting up webhook for Jon\'s device...');
    console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
    
    // Set up webhook
    const setupResponse = await makeRequest('https://api.sms-gate.app/3rdparty/v1/webhooks', {
      method: 'PUT',
      body: {
        url: WEBHOOK_URL,
        events: ['sms:received', 'sms:sent', 'sms:delivered', 'sms:failed']
      }
    });

    if (setupResponse.status === 200 || setupResponse.status === 201) {
      console.log('✅ Webhook setup successful!');
      console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
      console.log('📱 Events: sms:received, sms:sent, sms:delivered, sms:failed');
      console.log('');
      console.log('🎉 WEBHOOK SETUP COMPLETE!');
      console.log('=========================');
      console.log('✅ Jon\'s device will now send replies to your platform');
      console.log('✅ You can use Jon\'s device for mass messaging');
      console.log('✅ All replies will appear in your SMS Gateway tab');
      console.log('');
      console.log('🧪 TEST IT:');
      console.log('1. Send a test message using Jon\'s device');
      console.log('2. Reply to that message from your phone');
      console.log('3. Check the SMS Gateway tab in your platform');
      console.log('4. The reply should appear there!');
      
    } else {
      console.log(`❌ Failed to set up webhook (${setupResponse.status}):`, setupResponse.data);
    }

    console.log('');
    console.log('🔍 Step 3: Testing webhook endpoint...');
    
    // Test the webhook endpoint
    const testResponse = await makeRequest(WEBHOOK_URL, {
      method: 'POST',
      body: {
        event: 'sms:received',
        deviceId: 'jon-samsung-test',
        payload: {
          messageId: 'test-webhook-' + Date.now(),
          message: 'Test webhook setup for Jon\'s device',
          phoneNumber: '+14176297373',
          receivedAt: new Date().toISOString()
        }
      }
    });

    if (testResponse.status === 200) {
      console.log('✅ Webhook endpoint is working!');
      console.log('📊 Test response:', testResponse.data);
    } else {
      console.log(`⚠️ Webhook test response (${testResponse.status}):`, testResponse.data);
    }

  } catch (error) {
    console.error('❌ Error setting up webhooks:', error.message);
    console.log('');
    console.log('💡 ALTERNATIVE SETUP:');
    console.log('If automatic setup failed, you can manually configure in SMS Gateway app:');
    console.log(`1. Open SMS Gateway app on Jon's Samsung`);
    console.log('2. Go to Settings → Webhooks');
    console.log(`3. Set webhook URL to: ${WEBHOOK_URL}`);
    console.log('4. Enable events: sms:received, sms:sent, sms:delivered, sms:failed');
  }
}

console.log('🚀 Starting webhook setup for Jon\'s working device...');
setupJonWebhooks(); 