import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for SMS Gateway conversations
// In production, you'd use a database
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { phoneNumber, message, direction, status, endpoint, response } = data;

    const conversation = {
      id: `sms_gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message,
      direction: direction || 'outbound',
      status: status || 'sent',
      timestamp: new Date().toISOString(),
      endpoint,
      response
    };

    smsGatewayConversations.push(conversation);

    // Keep only last 1000 messages to prevent memory issues
    if (smsGatewayConversations.length > 1000) {
      smsGatewayConversations = smsGatewayConversations.slice(-1000);
    }

    console.log('💾 Saved SMS Gateway conversation:', {
      phoneNumber,
      direction,
      messagePreview: message.substring(0, 50) + '...'
    });

    return NextResponse.json({
      success: true,
      message: 'SMS Gateway conversation saved',
      id: conversation.id
    });

  } catch (error: any) {
    console.error('❌ Error saving SMS Gateway conversation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save conversation'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get unique phone numbers and their latest conversations
    const conversationsByPhone = new Map<string, any>();
    
    // Group conversations by phone number
    smsGatewayConversations.forEach(conv => {
      if (!conversationsByPhone.has(conv.phoneNumber)) {
        conversationsByPhone.set(conv.phoneNumber, {
          phoneNumber: conv.phoneNumber,
          messages: [],
          lastMessage: null,
          lastTimestamp: null
        });
      }
      
      const phoneConv = conversationsByPhone.get(conv.phoneNumber);
      phoneConv.messages.push(conv);
      
      // Update last message info
      if (!phoneConv.lastTimestamp || conv.timestamp > phoneConv.lastTimestamp) {
        phoneConv.lastMessage = conv.message;
        phoneConv.lastTimestamp = conv.timestamp;
      }
    });

    // Convert to array format similar to Twilio conversations
    const conversations = Array.from(conversationsByPhone.values()).map(conv => ({
      sid: `sms_gateway_${conv.phoneNumber}`,
      friendlyName: `SMS Gateway - ${conv.phoneNumber}`,
      participants: [{ identity: conv.phoneNumber }],
      lastMessage: conv.lastMessage,
      dateUpdated: conv.lastTimestamp,
      provider: 'sms_gateway',
      messageCount: conv.messages.length
    }));

    // Sort by last updated (most recent first)
    conversations.sort((a, b) => new Date(b.dateUpdated || '').getTime() - new Date(a.dateUpdated || '').getTime());

    return NextResponse.json({
      conversations,
      total: conversations.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching SMS Gateway conversations:', error);
    return NextResponse.json({
      conversations: [],
      total: 0,
      error: error.message
    }, { status: 500 });
  }
}

// Get messages for a specific phone number
export async function GET_MESSAGES(phoneNumber: string) {
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

  return messages;
} 