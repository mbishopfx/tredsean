#!/usr/bin/env node

// Script to update SMS Gateway webhook to local ngrok URL for development
// Usage: node update-webhook-to-local.js <ngrok-url>

const ngrokUrl = process.argv[2];

if (!ngrokUrl) {
  console.log('❌ Please provide your ngrok URL');
  console.log('Usage: node update-webhook-to-local.js https://xxxxxxxxx.ngrok-free.app');
  console.log('');
  console.log('📋 Steps:');
  console.log('1. Open http://localhost:4040 to get your ngrok URL');
  console.log('2. Copy the HTTPS URL (e.g., https://xxxxxxxxx.ngrok-free.app)');
  console.log('3. Run: node update-webhook-to-local.js <your-ngrok-url>');
  process.exit(1);
}

const webhookUrl = `${ngrokUrl}/api/sms-gateway/webhook`;

async function updateWebhook() {
  console.log('🔄 Updating SMS Gateway webhook...');
  console.log(`📍 New webhook URL: ${webhookUrl}`);
  
  try {
    // First, try to delete any existing webhooks
    console.log('🗑️ Deleting existing webhooks...');
    const deleteResponse = await fetch('https://api.sms-gate.app/3rdparty/v1/webhooks', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Existing webhooks deleted');
    } else {
      console.log('⚠️ No existing webhooks to delete or delete failed');
    }
    
    // Wait a moment for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new webhook
    console.log('📝 Creating new webhook...');
    const createResponse = await fetch('https://api.sms-gate.app/3rdparty/v1/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ['sms:received']
      })
    });
    
    const result = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Webhook updated successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      console.log('');
      console.log('🎉 You can now send real SMS messages to your phone number and they will appear in your local development server!');
      console.log('📱 Try sending an SMS to your SMS Gateway phone number to test.');
    } else {
      console.log('❌ Failed to create webhook');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      if (result.message === 'Unauthorized') {
        console.log('');
        console.log('🔑 Authentication failed. The SMS Gateway service might require authentication.');
        console.log('💡 Try using the SMS Gateway app to manually update the webhook URL to:');
        console.log(`   ${webhookUrl}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating webhook:', error);
    console.log('');
    console.log('💡 Alternative: Update the webhook manually in the SMS Gateway app');
    console.log(`   Set webhook URL to: ${webhookUrl}`);
  }
}

updateWebhook(); 