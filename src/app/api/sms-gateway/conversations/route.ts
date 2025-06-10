import { NextRequest, NextResponse } from 'next/server';
import { addSMSGatewayMessage, formatConversationsForAPI, getSMSGatewayConversations } from '@/lib/sms-gateway-storage';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { phoneNumber, message, direction, status, endpoint, response } = data;

    const conversation = await addSMSGatewayMessage({
      phoneNumber,
      message,
      direction: direction || 'outbound',
      status: status || 'sent',
      timestamp: new Date().toISOString(),
      endpoint,
      response
    });

    return NextResponse.json({
      success: true,
      message: 'SMS Gateway conversation saved'
    });

  } catch (error: any) {
    console.error('❌ Error saving SMS Gateway conversation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save conversation'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('📞 Fetching SMS Gateway conversations...');
    const conversations = await getSMSGatewayConversations();
    
    console.log(`📊 SMS Gateway API returning ${conversations.length} conversations`);
    
    return NextResponse.json({
      conversations,
      total: conversations.length
    });
  } catch (error) {
    console.error('❌ Error fetching SMS Gateway conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

 