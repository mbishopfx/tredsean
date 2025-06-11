import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 SMS Gateway request received');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log('📱 Sending SMS via Jon\'s device:', {
      to: phoneNumber.substring(0, 8) + '...',
      messageLength: message.length
    });

    // Use fetch instead of https module for better Vercel compatibility
    try {
      const smsGatewayResponse = await fetch('https://api.sms-gate.app/3rdparty/v1/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from('AD2XA0:2nitkjiqnmrrtc').toString('base64')}`,
        },
        body: JSON.stringify({
          message: message,
          phoneNumbers: [phoneNumber]
        }),
        // Add timeout using AbortController
        signal: AbortSignal.timeout(15000)
      });

      console.log('📊 SMS Gateway response status:', smsGatewayResponse.status);

      if (smsGatewayResponse.status === 202 || smsGatewayResponse.status === 200) {
        let responseData;
        try {
          responseData = await smsGatewayResponse.text();
          console.log('📄 Raw response:', responseData);
          
          if (!responseData || responseData.trim() === '') {
            console.log('⚠️ Empty response from SMS Gateway, using fallback');
            return NextResponse.json({
              success: true,
              messageId: `jon_${Date.now()}_fallback`,
              message: 'SMS sent successfully via Jon\'s device (fallback ID)'
            });
          }

          const parsed = JSON.parse(responseData);
          console.log('✅ Parsed response:', parsed);

          return NextResponse.json({
            success: true,
            messageId: parsed.id || `jon_${Date.now()}`,
            message: 'SMS sent successfully via Jon\'s device'
          });

        } catch (parseError: unknown) {
          console.log('⚠️ Could not parse response, but got success status:', parseError instanceof Error ? parseError.message : 'Unknown parse error');
          return NextResponse.json({
            success: true,
            messageId: `jon_${Date.now()}_parse_error`,
            message: 'SMS sent successfully via Jon\'s device (parse error fallback)'
          });
        }
      } else {
        const errorText = await smsGatewayResponse.text();
        console.error('❌ SMS Gateway error:', errorText);
        throw new Error(`SMS Gateway returned ${smsGatewayResponse.status}: ${errorText}`);
      }

    } catch (fetchError: any) {
      console.error('❌ Fetch error:', fetchError.message);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('SMS Gateway request timed out');
      }
      
      throw new Error(`SMS Gateway request failed: ${fetchError.message}`);
    }

  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send SMS',
        details: error.stack?.split('\n')[0] || 'No additional details'
      },
      { status: 500 }
    );
  }
} 