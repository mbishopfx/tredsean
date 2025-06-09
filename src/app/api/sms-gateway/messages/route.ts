import { NextRequest, NextResponse } from 'next/server';
import { getSMSGatewayMessages } from '@/lib/sms-gateway-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const messages = await getSMSGatewayMessages(phoneNumber);
    
    return NextResponse.json({
      messages,
      total: messages.length,
      phoneNumber
    });
  } catch (error) {
    console.error('❌ Error fetching SMS Gateway messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

 