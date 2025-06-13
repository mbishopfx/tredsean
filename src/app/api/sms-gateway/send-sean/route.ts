import { NextRequest, NextResponse } from 'next/server';
import { addSMSGatewayMessage } from '@/lib/sms-gateway-storage';
import https from 'https';

const SEAN_CREDENTIALS = 'YH1NKV:obiwpwuzrx5lip';
const SEAN_DEVICE = {
  username: 'sms',
  password: 'ycs-SLwL',
  phoneNumber: '13473803274'
};

// Rate limiting to prevent overwhelming the SMS Gateway
const requestQueue: Array<{ timestamp: number }> = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 30; // Max 30 requests per minute

function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Remove old requests outside the window
  while (requestQueue.length > 0 && requestQueue[0].timestamp < now - RATE_LIMIT_WINDOW) {
    requestQueue.shift();
  }
  
  // Check if we're at the limit
  if (requestQueue.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  // Add this request to the queue
  requestQueue.push({ timestamp: now });
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit first
    if (!checkRateLimit()) {
      console.log('⚠️ Rate limit exceeded - too many requests');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { status: 429 }
      );
    }

    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log('📱 Sending SMS via Sean\'s device:', {
      to: phoneNumber,
      messagePreview: message.substring(0, 50) + '...'
    });

    // Send via Sean's SMS Gateway device
    const smsResult = await sendViaSeansDevice(phoneNumber, message);

    if (smsResult.success) {
      // Save to conversation storage
      await addSMSGatewayMessage({
        phoneNumber: phoneNumber,
        message: message,
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date().toISOString(),
        endpoint: 'sean-device',
        response: `Message ID: ${smsResult.messageId}`
      });

      console.log('✅ SMS sent via Sean\'s device and saved to storage');

      return NextResponse.json({
        success: true,
        messageId: smsResult.messageId,
        message: 'SMS sent successfully via Sean\'s device'
      });
    } else {
      throw new Error(smsResult.error || 'Failed to send SMS');
    }

  } catch (error: any) {
    console.error('❌ Error sending SMS via Sean\'s device:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

function sendViaSeansDevice(phoneNumber: string, message: string): Promise<{success: boolean, messageId?: string, error?: string}> {
  return new Promise((resolve) => {
    // First try cloud API
    const cloudData = JSON.stringify({
      message: message,
      phoneNumbers: [phoneNumber],
      deviceUsername: SEAN_DEVICE.username,
      devicePassword: SEAN_DEVICE.password
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(SEAN_CREDENTIALS).toString('base64')}`,
        'Content-Length': cloudData.length
      }
    };

    // Set a timeout for the entire request
    const timeout = setTimeout(() => {
      console.error('❌ Sean\'s device request timed out after 10 seconds');
      resolve({
        success: false,
        error: 'Request timed out after 10 seconds'
      });
    }, 10000);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => { 
        responseData += chunk; 
      });
      
      res.on('end', () => {
        clearTimeout(timeout);
        
        console.log(`📊 Sean's device status: ${res.statusCode}`);
        console.log(`📋 Raw response: ${responseData}`);
        
        try {
          // Handle successful responses
          if (res.statusCode === 202 || res.statusCode === 200) {
            if (!responseData || responseData.trim() === '') {
              console.log('⚠️ Empty response but success status - generating fallback ID');
              resolve({
                success: true,
                messageId: `sean_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              });
              return;
            }
            
            try {
              const parsed = JSON.parse(responseData);
              console.log('✅ Sean\'s device responded successfully:', parsed);
              resolve({
                success: true,
                messageId: parsed.id || `sean_${Date.now()}`
              });
            } catch (parseError) {
              console.log('⚠️ Could not parse JSON but got success status - using fallback');
              resolve({
                success: true,
                messageId: `sean_${Date.now()}_fallback`
              });
            }
          } else {
            console.error(`❌ Sean\'s device error (${res.statusCode}):`, responseData);
            resolve({
              success: false,
              error: `HTTP ${res.statusCode}: ${responseData || 'No response body'}`
            });
          }
        } catch (error) {
          console.error('❌ Error processing response:', error);
          resolve({
            success: false,
            error: `Response processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Sean\'s device request failed:', error);
      resolve({
        success: false,
        error: `Network error: ${error.message}`
      });
    });

    req.on('timeout', () => {
      clearTimeout(timeout);
      console.error('❌ Sean\'s device request timed out');
      req.destroy();
      resolve({
        success: false,
        error: 'Request timed out'
      });
    });

    try {
      req.write(cloudData);
      req.end();
    } catch (writeError) {
      clearTimeout(timeout);
      console.error('❌ Error writing request data:', writeError);
      resolve({
        success: false,
        error: `Write error: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`
      });
    }
  });
} 