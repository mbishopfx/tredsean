import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, userCredentials } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    if (!userCredentials?.cloudUsername || !userCredentials?.cloudPassword) {
      return NextResponse.json(
        { error: 'User SMS Gateway credentials are required' },
        { status: 400 }
      );
    }

    console.log(`📱 Sending SMS via user's device: ${userCredentials.deviceName || 'Unknown Device'}`);
    console.log(`📞 To: ${phoneNumber}`);
    console.log(`💬 Message: ${message.substring(0, 50)}...`);

    const smsData = {
      message: message,
      phoneNumbers: [phoneNumber]
    };

    const response = await fetch('https://api.sms-gate.app/3rdparty/v1/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${userCredentials.cloudUsername}:${userCredentials.cloudPassword}`).toString('base64')}`,
      },
      body: JSON.stringify(smsData),
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    console.log(`📡 SMS Gateway Response Status: ${response.status}`);

    if (response.status === 202 || response.status === 200) {
      let responseData;
      const responseText = await response.text();
      
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.log('⚠️ Response not JSON, treating as success');
          responseData = { success: true, message: 'SMS sent successfully' };
        }
      } else {
        console.log('⚠️ Empty response body, treating as success');
        responseData = { success: true, message: 'SMS sent successfully' };
      }

      console.log('✅ SMS sent successfully via user device');
      
      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        data: responseData,
        deviceInfo: {
          deviceName: userCredentials.deviceName,
          status: userCredentials.status
        }
      });
    } else {
      console.error(`❌ SMS Gateway API error: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      return NextResponse.json(
        { 
          error: `SMS Gateway API error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error('❌ SMS sending error:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'SMS Gateway request timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 