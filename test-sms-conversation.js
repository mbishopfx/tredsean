#!/usr/bin/env node

/**
 * Test script for SMS Gateway conversation flow
 * 1. Sends an SMS message via the local API
 * 2. Simulates a reply webhook call to test the full flow
 */

const https = require('https');
const http = require('http');

// Configuration
const LOCAL_SERVER = 'http://localhost:3001';
const TEST_PHONE = '14176297373';
const TEST_MESSAGE = `Test conversation flow - ${new Date().toLocaleTimeString()}`;

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
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Step 1: Send SMS message
async function sendTestMessage() {
  console.log('📤 Step 1: Sending test SMS message...');
  
  try {
    const response = await makeRequest(`${LOCAL_SERVER}/api/sms/send`, {
      method: 'POST',
      body: {
        phoneNumbers: [TEST_PHONE],
        message: TEST_MESSAGE,
        provider: 'personal',
        credentials: {
          provider: 'smsgateway',
          email: 'sean@trurankdigital.com',
          password: 'mpx-bhqzhm8bvg'
        }
      }
    });
    
    console.log(`✅ SMS sent! Status: ${response.status}`);
    console.log(`📋 Response:`, response.data);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    return false;
  }
}

// Step 2: Simulate incoming reply webhook
async function simulateReplyWebhook() {
  console.log('📨 Step 2: Simulating incoming reply webhook...');
  
  const replyMessage = `Test reply to: ${TEST_MESSAGE}`;
  const webhookPayload = {
    event: 'sms:received',
    deviceId: 'test-device-local',
    payload: {
      messageId: `test-reply-${Date.now()}`,
      message: replyMessage,
      phoneNumber: `+${TEST_PHONE}`,
      receivedAt: new Date().toISOString()
    }
  };
  
  try {
    const response = await makeRequest(`${LOCAL_SERVER}/api/sms-gateway/webhook`, {
      method: 'POST',
      body: webhookPayload
    });
    
    console.log(`✅ Webhook processed! Status: ${response.status}`);
    console.log(`📋 Response:`, response.data);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Failed to process webhook:', error);
    return false;
  }
}

// Step 3: Check conversations
async function checkConversations() {
  console.log('🔍 Step 3: Checking SMS Gateway conversations...');
  
  try {
    const response = await makeRequest(`${LOCAL_SERVER}/api/sms-gateway/conversations`);
    
    console.log(`✅ Conversations retrieved! Status: ${response.status}`);
    console.log(`📋 Total conversations: ${response.data.conversations?.length || 0}`);
    
    if (response.data.conversations?.length > 0) {
      console.log('📱 Recent conversations:');
      response.data.conversations.slice(0, 3).forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv.phoneNumber}: ${conv.messagePreview}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to check conversations:', error);
    return false;
  }
}

// Step 4: Check messages for the test phone number
async function checkMessages() {
  console.log('💬 Step 4: Checking messages for test phone number...');
  
  try {
    const response = await makeRequest(`${LOCAL_SERVER}/api/sms-gateway/messages?phoneNumber=%2B${TEST_PHONE}`);
    
    console.log(`✅ Messages retrieved! Status: ${response.status}`);
    console.log(`📋 Total messages: ${response.data.messages?.length || 0}`);
    
    if (response.data.messages?.length > 0) {
      console.log('💬 Recent messages:');
      response.data.messages.slice(-5).forEach((msg, index) => {
        const direction = msg.direction === 'outbound' ? '📤' : '📥';
        console.log(`  ${direction} ${msg.direction}: ${msg.message}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to check messages:', error);
    return false;
  }
}

// Main test function
async function runTest() {
  console.log('🚀 Starting SMS Gateway conversation test...');
  console.log(`📞 Test phone: ${TEST_PHONE}`);
  console.log(`🏠 Local server: ${LOCAL_SERVER}`);
  console.log('─'.repeat(50));
  
  // Step 1: Send message
  const sentSuccess = await sendTestMessage();
  if (!sentSuccess) {
    console.log('❌ Test failed at message sending step');
    return;
  }
  
  // Wait a moment
  console.log('⏳ Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Simulate reply
  const webhookSuccess = await simulateReplyWebhook();
  if (!webhookSuccess) {
    console.log('❌ Test failed at webhook simulation step');
    return;
  }
  
  // Wait a moment
  console.log('⏳ Waiting 1 second...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 3: Check conversations
  await checkConversations();
  
  // Step 4: Check messages
  await checkMessages();
  
  console.log('─'.repeat(50));
  console.log('✅ Test completed! Check your SMS Gateway tab in the browser to see the conversation.');
  console.log(`🌐 Open: ${LOCAL_SERVER}`);
}

// Run the test
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest, sendTestMessage, simulateReplyWebhook }; 