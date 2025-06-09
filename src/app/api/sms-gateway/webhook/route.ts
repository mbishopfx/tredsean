import { NextRequest, NextResponse } from 'next/server';
import { addSMSGatewayMessage } from '@/lib/sms-gateway-storage';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);
    
    console.log('📨 SMS Gateway Webhook received:', {
      event: data.event,
      deviceId: data.deviceId,
      payload: data.payload
    });

    // Verify the webhook signature if available
    const signature = request.headers.get('X-Signature');
    const timestamp = request.headers.get('X-Timestamp');
    
    if (signature && timestamp) {
      // TODO: Implement signature verification when we have the signing key
      console.log('🔐 Webhook signature verification available');
    }

    // Process incoming SMS messages
    if (data.event === 'sms:received' && data.payload) {
      const { phoneNumber, message, receivedAt, messageId } = data.payload;
      
      console.log('📱 Processing incoming SMS:', {
        from: phoneNumber,
        message: message?.substring(0, 50) + '...',
        receivedAt
      });

      // Save to SMS Gateway conversation storage
      await addSMSGatewayMessage({
        phoneNumber: phoneNumber,
        message: message,
        direction: 'inbound',
        status: 'received',
        timestamp: receivedAt || new Date().toISOString(),
        endpoint: 'webhook',
        response: `Webhook message ID: ${messageId}`
      });

      console.log('✅ Incoming SMS saved to conversation storage');
    }

    // Handle other events if needed
    if (data.event === 'sms:sent') {
      console.log('📤 SMS sent confirmation received');
    }

    if (data.event === 'sms:delivered') {
      console.log('✅ SMS delivery confirmation received');
    }

    if (data.event === 'sms:failed') {
      console.log('❌ SMS failure notification received');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('❌ SMS Gateway webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'SMS Gateway webhook endpoint active',
    timestamp: new Date().toISOString()
  });
} 