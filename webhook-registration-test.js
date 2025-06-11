const https = require('https');

const JON_CREDENTIALS = 'AD2XA0:2nitkjiqnmrrtc';
const WEBHOOK_URL = 'https://smsdialer.vercel.app/api/sms-gateway/webhook';

console.log('🔧 TESTING WEBHOOK REGISTRATION METHODS');
console.log('=======================================');
console.log(`Jon's Credentials: ${JON_CREDENTIALS}`);
console.log(`Webhook URL: ${WEBHOOK_URL}`);
console.log('');

async function testMethod1_CorrectFormat() {
  console.log('📝 METHOD 1: Correct webhook format with individual events');
  console.log('=========================================================');
  
  try {
    const webhookData = JSON.stringify({
      url: WEBHOOK_URL,
      event: "message:received" // Try single event first
    });

    const req = https.request({
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/webhooks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`,
        'Content-Length': webhookData.length
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        console.log('');
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      console.log('');
    });

    req.write(webhookData);
    req.end();

  } catch (error) {
    console.log('❌ Method 1 failed:', error.message);
    console.log('');
  }
}

async function testMethod2_MultipleWebhooks() {
  console.log('📝 METHOD 2: Register multiple webhooks separately');
  console.log('=================================================');
  
  const events = ['message:received', 'message:sent', 'message:delivered'];
  
  for (const event of events) {
    console.log(`Registering webhook for: ${event}`);
    
    try {
      const webhookData = JSON.stringify({
        url: WEBHOOK_URL,
        event: event
      });

      const req = https.request({
        hostname: 'api.sms-gate.app',
        port: 443,
        path: '/3rdparty/v1/webhooks',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`,
          'Content-Length': webhookData.length
        }
      }, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          console.log(`${event} - Status: ${res.statusCode} - Response: ${responseData}`);
        });
      });

      req.on('error', (error) => {
        console.log(`${event} - ❌ Failed:`, error.message);
      });

      req.write(webhookData);
      req.end();

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`${event} - ❌ Error:`, error.message);
    }
  }
  console.log('');
}

async function testMethod3_AlternativeEndpoint() {
  console.log('📝 METHOD 3: Try alternative webhook endpoint');
  console.log('===========================================');
  
  try {
    const webhookData = JSON.stringify({
      url: WEBHOOK_URL,
      events: ['message:received']
    });

    const req = https.request({
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/webhook', // Singular instead of plural
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`,
        'Content-Length': webhookData.length
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        console.log('');
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      console.log('');
    });

    req.write(webhookData);
    req.end();

  } catch (error) {
    console.log('❌ Method 3 failed:', error.message);
    console.log('');
  }
}

async function checkWebhookCapabilities() {
  console.log('📝 CHECKING WEBHOOK CAPABILITIES');
  console.log('================================');
  
  try {
    // Check if webhooks are supported for this account
    const req = https.request({
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/account', // Check account info
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log('Account Info:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        console.log('');
      });
    });

    req.on('error', (error) => {
      console.log('❌ Account check failed:', error.message);
      console.log('');
    });

    req.end();

  } catch (error) {
    console.log('❌ Account check error:', error.message);
    console.log('');
  }
}

async function checkExistingWebhooks() {
  console.log('📝 CHECKING EXISTING WEBHOOKS');
  console.log('=============================');
  
  try {
    const req = https.request({
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/webhooks',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log('Existing Webhooks:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        console.log('');
      });
    });

    req.on('error', (error) => {
      console.log('❌ Webhook check failed:', error.message);
      console.log('');
    });

    req.end();

  } catch (error) {
    console.log('❌ Webhook check error:', error.message);
    console.log('');
  }
}

async function showAlternatives() {
  console.log('💡 ALTERNATIVE WEBHOOK SETUP METHODS');
  console.log('====================================');
  console.log('');
  console.log('If API webhook registration doesn\'t work, try these alternatives:');
  console.log('');
  console.log('🌐 WEB INTERFACE METHOD:');
  console.log('1. Go to https://sms-gate.app/');
  console.log('2. Login with Google account (same as mobile app)');
  console.log('3. Look for "Webhooks" or "Integrations" section');
  console.log('4. Add webhook URL: https://smsdialer.vercel.app/api/sms-gateway/webhook');
  console.log('');
  console.log('📱 MOBILE APP ALTERNATIVES:');
  console.log('1. Check if app has "Cloud" or "Web" settings');
  console.log('2. Look for "API Settings" or "Developer Options"');
  console.log('3. Try long-pressing on settings to reveal advanced options');
  console.log('');
  console.log('🔄 POLLING ALTERNATIVE:');
  console.log('Since Jon\'s device is working for outbound, we can:');
  console.log('1. Use it for sending (which works perfectly)');
  console.log('2. Set up polling to check for replies periodically');
  console.log('3. This gives us 90% of the functionality without webhooks');
  console.log('');
  console.log('⚡ CURRENT WORKING FEATURES:');
  console.log('✅ Send messages via Jon\'s device');
  console.log('✅ Mass campaigns via Jon\'s device');
  console.log('✅ Message storage and tracking');
  console.log('✅ Chat interface ready');
  console.log('⚠️  Manual reply checking (until webhook works)');
  console.log('');
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive webhook registration tests...');
  console.log('');
  
  await checkExistingWebhooks();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await checkWebhookCapabilities();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testMethod1_CorrectFormat();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testMethod2_MultipleWebhooks();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testMethod3_AlternativeEndpoint();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await showAlternatives();
}

runAllTests(); 