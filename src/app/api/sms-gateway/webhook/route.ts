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

    // Handle incoming SMS events
    if (data.event === 'sms:received' && data.payload) {
      const { messageId, message, phoneNumber, receivedAt } = data.payload;
      
      console.log('📱 Processing incoming SMS:', {
        from: phoneNumber,
        message: message.substring(0, 50) + '...',
        receivedAt
      });

      // Save the incoming message to our SMS Gateway storage
      addSMSGatewayMessage({
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
        message: message,
        direction: 'inbound',
        status: 'received',
        endpoint: 'webhook',
        response: JSON.stringify({ messageId, receivedAt })
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

    // Return success response (SMS Gateway expects 2xx status)
    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error: any) {
    console.error('❌ SMS Gateway Webhook Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'SMS Gateway Webhook endpoint is active',
    events: ['sms:received', 'sms:sent', 'sms:delivered', 'sms:failed'],
    status: 'ready'
  });
} 