const https = require('https');

console.log('📱 SETTING UP JON\'S DEVICE FOR REPLIES');
console.log('======================================');
console.log('Configuring webhook system for SMS conversations');
console.log('');

const jonCredentials = 'AD2XA0:2nitkjiqnmrrtc';
const webhookUrl = 'https://smsdialer.vercel.app/api/sms-gateway/webhook';

async function setupJonWebhook() {
  console.log('🔗 CONFIGURING WEBHOOK FOR JON\'S DEVICE');
  console.log('========================================');
  console.log(`Webhook URL: ${webhookUrl}`);
  console.log('');

  // First, let's check current webhook settings
  try {
    console.log('📋 Checking current webhook configuration...');
    
    const webhookCheckReq = https.request({
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/webhooks',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(jonCredentials).toString('base64')}`
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log('Current webhook settings:');
        console.log(responseData);
        console.log('');
      });
    });
    
    webhookCheckReq.on('error', (error) => {
      console.log('❌ Error checking webhooks:', error.message);
    });
    
    webhookCheckReq.end();

  } catch (error) {
    console.log('❌ Webhook check failed:', error.message);
  }

  // Wait a bit then try to configure webhook
  setTimeout(async () => {
    try {
      console.log('⚙️  Attempting to set up webhook...');
      
      const webhookData = JSON.stringify({
        url: webhookUrl,
        events: ['message:received', 'message:sent', 'message:delivered']
      });

      const webhookSetupReq = https.request({
        hostname: 'api.sms-gate.app',
        port: 443,
        path: '/3rdparty/v1/webhooks',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(jonCredentials).toString('base64')}`,
          'Content-Length': webhookData.length
        }
      }, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Webhook configured successfully!');
            console.log('Response:', responseData);
          } else {
            console.log(`❌ Webhook setup failed (${res.statusCode}):`, responseData);
            console.log('');
            console.log('💡 MANUAL SETUP REQUIRED:');
            console.log('=========================');
            console.log('1. Open SMS Gateway app on Jon\'s Samsung');
            console.log('2. Go to Settings > Webhooks');
            console.log('3. Add webhook URL: https://smsdialer.vercel.app/api/sms-gateway/webhook');
            console.log('4. Enable events: message:received, message:sent, message:delivered');
          }
          console.log('');
        });
      });

      webhookSetupReq.on('error', (error) => {
        console.log('❌ Webhook setup request failed:', error.message);
        console.log('');
        console.log('💡 MANUAL SETUP REQUIRED - see instructions above');
      });

      webhookSetupReq.write(webhookData);
      webhookSetupReq.end();

    } catch (error) {
      console.log('❌ Webhook configuration failed:', error.message);
    }
  }, 3000);
}

async function testJonReplySystem() {
  console.log('🧪 TESTING JON\'S REPLY SYSTEM');
  console.log('==============================');
  
  const testMessage = `REPLY TEST from Jon - ${new Date().toLocaleTimeString()} - Please reply "TEST OK" to confirm webhook works!`;
  
  try {
    const data = JSON.stringify({
      message: testMessage,
      phoneNumbers: ['+14176297373']
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(jonCredentials).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 202) {
          const parsed = JSON.parse(responseData);
          console.log('✅ Test message sent from Jon\'s device!');
          console.log(`Message ID: ${parsed.id}`);
          console.log('');
          console.log('📱 CHECK YOUR PHONE:');
          console.log('=====================');
          console.log('1. You should receive the test message');
          console.log('2. Reply with "TEST OK"');
          console.log('3. Check webhook endpoint for incoming reply');
          console.log('4. If webhook works, reply should appear in platform');
          console.log('');
        } else {
          console.log('❌ Test message failed:', responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Test message request failed:', error.message);
    });

    req.write(data);
    req.end();

  } catch (error) {
    console.log('❌ Reply test failed:', error.message);
  }
}

async function showNextSteps() {
  console.log('📋 NEXT STEPS FOR FULL INTEGRATION');
  console.log('===================================');
  console.log('');
  
  console.log('1. ✅ Jon\'s device confirmed working for outbound');
  console.log('2. 🔄 Webhook setup (manual if automatic fails)');
  console.log('3. 🧪 Test reply functionality');
  console.log('4. 💻 Build chat UI tab in platform');
  console.log('5. 🗃️  Store conversations in database');
  console.log('6. 🔔 Real-time notifications for new replies');
  console.log('');

  console.log('📱 PLATFORM INTEGRATION PLAN:');
  console.log('==============================');
  console.log('');
  console.log('Database Schema:');
  console.log('- conversations table (id, phone, created_at)');
  console.log('- messages table (id, conversation_id, content, direction, timestamp)');
  console.log('');
  console.log('API Endpoints:');
  console.log('- POST /api/sms-gateway/webhook (receive replies)');
  console.log('- GET /api/conversations (list conversations)');
  console.log('- GET /api/conversations/:id/messages (get messages)');
  console.log('- POST /api/conversations/:id/send (send message)');
  console.log('');
  console.log('UI Components:');
  console.log('- Chat tab in toolbar');
  console.log('- Conversation list');
  console.log('- Message thread view');
  console.log('- Send message interface');
}

async function runJonSetup() {
  console.log('🚀 Starting Jon\'s reply system setup...');
  console.log('');
  
  await setupJonWebhook();
  
  setTimeout(() => {
    testJonReplySystem();
  }, 5000);
  
  setTimeout(() => {
    showNextSteps();
  }, 8000);
}

runJonSetup(); 