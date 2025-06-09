import { NextRequest, NextResponse } from 'next/server';
import { getSMSGatewayMessages } from '@/lib/sms-gateway-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 });
    }

    // Get messages for the specific phone number
    const messages = getSMSGatewayMessages(phoneNumber);

    return NextResponse.json({
      messages,
      total: messages.length,
      phoneNumber
    });

  } catch (error: any) {
    console.error('❌ Error fetching SMS Gateway messages:', error);
    return NextResponse.json({
      messages: [],
      total: 0,
      error: error.message
    }, { status: 500 });
  }
}

 