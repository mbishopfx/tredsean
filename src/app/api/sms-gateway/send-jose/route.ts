import { NextResponse } from 'next/server';

const SMS_GATEWAY_URL = 'https://api.sms-gate.app:443/3rdparty/v1';
const USERNAME = '_NNSZW';
const PASSWORD = '9qajexoy9ihhnl';

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log('📤 Sending SMS via Jose\'s device:', {
      to: phoneNumber.substring(0, 8) + '...',
      messageLength: message.length
    });

    const response = await fetch(`${SMS_GATEWAY_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`)
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        device: 'primary',
        priority: 1,
        sim: 1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ SMS Gateway error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to send message' },
        { status: response.status }
      );
    }

    console.log('✅ SMS Gateway response:', data);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('❌ SMS Gateway error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 