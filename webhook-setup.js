#!/usr/bin/env node

/**
 * SMS Gateway Webhook Setup Script
 * Updates webhook URL to point to correct production server
 */

const https = require('https');
const http = require('http');

// Configuration - Updated to correct production URL
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/sms-gateway/webhook';
const PRODUCTION_WEBHOOK_URL = 'https://smsdialer.vercel.app/api/sms-gateway/webhook'; // Updated to correct domain

// SMS Gateway credentials
const SMS_GATEWAY_API = 'https://api.sms-gate.app';
const AUTH_HEADER = `Basic ${Buffer.from('AUZNLR:mpx-bhqzhm8bvg').toString('base64')}`;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
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

// Main webhook setup function
async function setupWebhook() {
  console.log('🔧 SMS Gateway Webhook Setup');
  console.log('=============================\n');

  try {
    // Step 1: Check current webhook configuration
    console.log('📋 Step 1: Checking current webhook configuration...');
    
    const webhookCheckResponse = await makeRequest(`${SMS_GATEWAY_API}/3rdparty/v1/webhooks`);
    
    if (webhookCheckResponse.status === 200) {
      console.log('✅ Current webhook configuration:');
      console.log(JSON.stringify(webhookCheckResponse.data, null, 2));
    } else {
      console.log(`⚠️ Could not retrieve webhook config (${webhookCheckResponse.status}):`, webhookCheckResponse.data);
    }

    // Step 2: Set webhook to local development URL
    console.log('\n📡 Step 2: Setting webhook to local development URL...');
    
    const setWebhookResponse = await makeRequest(`${SMS_GATEWAY_API}/3rdparty/v1/webhooks`, {
      method: 'PUT',
      body: {
        url: LOCAL_WEBHOOK_URL,
        events: ['sms:received']
      }
    });

    if (setWebhookResponse.status === 200 || setWebhookResponse.status === 201) {
      console.log('✅ Webhook updated successfully!');
      console.log(`📍 Webhook URL: ${LOCAL_WEBHOOK_URL}`);
      console.log('📱 Events: sms:received');
    } else {
      console.log(`❌ Failed to update webhook (${setWebhookResponse.status}):`, setWebhookResponse.data);
    }

    // Step 3: Test the webhook endpoint
    console.log('\n🧪 Step 3: Testing local webhook endpoint...');
    
    const testWebhookResponse = await makeRequest(LOCAL_WEBHOOK_URL.replace('localhost', '127.0.0.1'), {
      method: 'POST',
      body: {
        event: 'sms:received',
        deviceId: 'test-device-local',
        payload: {
          messageId: 'test-webhook-setup-' + Date.now(),
          message: 'Test incoming message for webhook setup',
          phoneNumber: '+14176297373',
          receivedAt: new Date().toISOString()
        }
      }
    });

    if (testWebhookResponse.status === 200) {
      console.log('✅ Local webhook endpoint is working!');
    } else {
      console.log(`⚠️ Local webhook test failed (${testWebhookResponse.status}):`, testWebhookResponse.data);
    }

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Send an SMS from your phone to Sean\'s number');
  console.log('2. Check your local development server logs for incoming webhook calls');
  console.log('3. The incoming message should appear in the SMS Gateway tab');
  console.log('\n📝 Note: When you\'re done testing locally, run this script with --production to switch back to production webhook');
}

// Handle production webhook setup
async function setupProductionWebhook() {
  console.log('🌐 Setting webhook back to production...');
  
  try {
    const setWebhookResponse = await makeRequest(`${SMS_GATEWAY_API}/3rdparty/v1/webhooks`, {
      method: 'PUT',
      body: {
        url: PRODUCTION_WEBHOOK_URL,
        events: ['sms:received']
      }
    });

    if (setWebhookResponse.status === 200 || setWebhookResponse.status === 201) {
      console.log('✅ Webhook updated to production!');
      console.log(`📍 Webhook URL: ${PRODUCTION_WEBHOOK_URL}`);
    } else {
      console.log(`❌ Failed to update webhook (${setWebhookResponse.status}):`, setWebhookResponse.data);
    }
  } catch (error) {
    console.error('❌ Error setting production webhook:', error.message);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.includes('--production')) {
  setupProductionWebhook();
} else {
  setupWebhook();
} 