import { NextRequest, NextResponse } from 'next/server';
import { addSMSGatewayMessage } from '@/lib/sms-gateway-storage';
import https from 'https';

const JON_CREDENTIALS = 'AD2XA0:2nitkjiqnmrrtc';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log('📱 Sending SMS via Jon\'s device:', {
      to: phoneNumber,
      messagePreview: message.substring(0, 50) + '...'
    });

    // Send via Jon's SMS Gateway device
    const smsResult = await sendViaJonDevice(phoneNumber, message);

    if (smsResult.success) {
      // Save to conversation storage
      await addSMSGatewayMessage({
        phoneNumber: phoneNumber,
        message: message,
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date().toISOString(),
        endpoint: 'jon-device',
        response: `Message ID: ${smsResult.messageId}`
      });

      console.log('✅ SMS sent via Jon\'s device and saved to storage');

      return NextResponse.json({
        success: true,
        messageId: smsResult.messageId,
        message: 'SMS sent successfully via Jon\'s device'
      });
    } else {
      throw new Error(smsResult.error || 'Failed to send SMS');
    }

  } catch (error: any) {
    console.error('❌ Error sending SMS via Jon\'s device:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

function sendViaJonDevice(phoneNumber: string, message: string): Promise<{success: boolean, messageId?: string, error?: string}> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      phoneNumbers: [phoneNumber]
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(JON_CREDENTIALS).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 202) {
            const parsed = JSON.parse(responseData);
            console.log('✅ Jon\'s device responded successfully:', parsed);
            resolve({
              success: true,
              messageId: parsed.id
            });
          } else {
            console.error('❌ Jon\'s device error:', responseData);
            resolve({
              success: false,
              error: `HTTP ${res.statusCode}: ${responseData}`
            });
          }
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Failed to parse response'
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Jon\'s device request failed:', error);
      resolve({
        success: false,
        error: error.message
      });
    });

    req.write(data);
    req.end();
  });
} 