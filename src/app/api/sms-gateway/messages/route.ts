import { NextRequest, NextResponse } from 'next/server';

// Import the conversations storage (in production this would be from a database)
// For now, we'll recreate the import since we can't directly import from the other route
// This is a temporary solution - in production you'd use a shared database

let smsGatewayConversations: Array<{
  id: string;
  phoneNumber: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: string;
  endpoint?: string;
  response?: string;
}> = [];

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
    const messages = smsGatewayConversations
      .filter(conv => conv.phoneNumber === phoneNumber)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(conv => ({
        sid: conv.id,
        body: conv.message,
        from: conv.direction === 'outbound' ? 'SMS Gateway' : conv.phoneNumber,
        to: conv.direction === 'outbound' ? conv.phoneNumber : 'SMS Gateway',
        direction: conv.direction,
        status: conv.status,
        dateCreated: conv.timestamp,
        provider: 'sms_gateway'
      }));

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

// Export a function to add messages (called from the conversations route)
export function addSMSGatewayMessage(conversation: {
  id: string;
  phoneNumber: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: string;
  endpoint?: string;
  response?: string;
}) {
  smsGatewayConversations.push(conversation);
  
  // Keep only last 1000 messages
  if (smsGatewayConversations.length > 1000) {
    smsGatewayConversations = smsGatewayConversations.slice(-1000);
  }
}

// Export function to get all conversations (for the conversations route)
export function getSMSGatewayConversations() {
  return smsGatewayConversations;
} 