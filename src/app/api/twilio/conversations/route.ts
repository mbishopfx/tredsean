import { Twilio } from 'twilio';
import { NextRequest, NextResponse } from 'next/server';

// Type definitions
type MessageData = {
  sid: string;
  body: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound' | 'outbound-api';
  status: string;
  dateCreated: string;
  dateUpdated: string;
};

type Conversation = {
  phoneNumber: string;
  messages: MessageData[];
  lastMessageDate: string;
  lastMessageText: string;
  lastMessageDirection: 'inbound' | 'outbound' | 'outbound-api';
  unreadCount: number;
};

// Mock data for testing when Twilio credentials aren't available
const getMockData = (phoneNumber: string | null) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  // Create mock conversation with the specific number for pipeline testing
  const mockConversations: Conversation[] = [
    {
      phoneNumber: "14176297373",
      messages: [
        {
          sid: "mock_sid_1",
          body: "Hi, I'm interested in your services",
          from: "14176297373",
          to: "12025551234", // Mock Twilio number
          direction: "inbound",
          status: "delivered",
          dateCreated: yesterday.toISOString(),
          dateUpdated: yesterday.toISOString(),
        },
        {
          sid: "mock_sid_2",
          body: "Thanks for reaching out! What specific services are you interested in?",
          from: "12025551234", // Mock Twilio number
          to: "14176297373",
          direction: "outbound",
          status: "delivered",
          dateCreated: yesterday.toISOString(),
          dateUpdated: yesterday.toISOString(),
        },
        {
          sid: "mock_sid_3",
          body: "I'd like to learn more about your premium package",
          from: "14176297373",
          to: "12025551234", // Mock Twilio number
          direction: "inbound",
          status: "delivered",
          dateCreated: now.toISOString(),
          dateUpdated: now.toISOString(),
        }
      ],
      lastMessageDate: now.toISOString(),
      lastMessageText: "I'd like to learn more about your premium package",
      lastMessageDirection: "inbound",
      unreadCount: 1
    },
    {
      phoneNumber: "19876543210",
      messages: [
        {
          sid: "mock_sid_4",
          body: "Hello, do you provide consulting services?",
          from: "19876543210",
          to: "12025551234",
          direction: "inbound",
          status: "delivered",
          dateCreated: yesterday.toISOString(),
          dateUpdated: yesterday.toISOString(),
        },
        {
          sid: "mock_sid_5",
          body: "Yes, we offer a variety of consulting services. What are you looking for?",
          from: "12025551234",
          to: "19876543210",
          direction: "outbound",
          status: "delivered",
          dateCreated: yesterday.toISOString(),
          dateUpdated: yesterday.toISOString(),
        }
      ],
      lastMessageDate: yesterday.toISOString(),
      lastMessageText: "Yes, we offer a variety of consulting services. What are you looking for?",
      lastMessageDirection: "outbound",
      unreadCount: 0
    }
  ];

  if (phoneNumber) {
    const mockConversation = mockConversations.find(c => c.phoneNumber === phoneNumber);
    if (mockConversation) {
      return {
        phoneNumber,
        messages: mockConversation.messages
      };
    }
    return {
      phoneNumber,
      messages: []
    };
  }

  return { conversations: mockConversations };
};

export async function GET(request: NextRequest) {
  try {
    // Initialize Twilio client with environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const filterNumber = searchParams.get('phoneNumber') || null;

    // If Twilio credentials are not configured, return mock data
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured. Using mock data instead.");
      return NextResponse.json(getMockData(filterNumber));
    }

    const client = new Twilio(accountSid, authToken);
    
    // Calculate date range for retrieving messages (last 30 days by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Retrieve messages from Twilio
    const messages = await client.messages.list({
      dateSentAfter: startDate,
      dateSentBefore: endDate,
      limit: 1000 // Adjust as needed
    });

    // If filterNumber provided, return just the messages for that number
    if (filterNumber) {
      const filteredMessages = messages.filter(message => 
        message.from === filterNumber || message.to === filterNumber
      ).map(message => {
        // Check if this is an outbound message (from our Twilio number to the contact)
        const isOutbound = message.from === twilioPhoneNumber;
        
        return {
          sid: message.sid,
          body: message.body || '',
          from: message.from || '',
          to: message.to || '',
          direction: isOutbound ? 'outbound' : 'inbound',
          status: message.status || '',
          dateCreated: message.dateCreated?.toISOString() || '',
          dateUpdated: message.dateUpdated?.toISOString() || ''
        };
      }).sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());

      return NextResponse.json({
        phoneNumber: filterNumber,
        messages: filteredMessages
      });
    }

    // Group messages by phone number to create conversations
    const conversationMap = new Map<string, MessageData[]>();
    
    messages.forEach(message => {
      // Determine the other party of the conversation (not our Twilio number)
      let otherParty = message.from === twilioPhoneNumber ? message.to : message.from;
      if (!otherParty) otherParty = 'unknown';
      
      // Get or create the conversation
      if (!conversationMap.has(otherParty)) {
        conversationMap.set(otherParty, []);
      }
      
      // Add the message to the conversation
      const conversation = conversationMap.get(otherParty)!;
      
      // Check if this is an outbound message (from our Twilio number to the contact)
      const isOutbound = message.from === twilioPhoneNumber;
      
      conversation.push({
        sid: message.sid,
        body: message.body || '',
        from: message.from || '',
        to: message.to || '',
        direction: isOutbound ? 'outbound' : 'inbound',
        status: message.status || '',
        dateCreated: message.dateCreated?.toISOString() || '',
        dateUpdated: message.dateUpdated?.toISOString() || ''
      });
    });
    
    // Transform map to array and sort conversations by most recent message
    const conversations: Conversation[] = Array.from(conversationMap.entries())
      .map(([phoneNumber, messages]) => {
        // Sort messages chronologically
        messages.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
        
        // Get the most recent message
        const lastMessage = messages[messages.length - 1];
        
        // Count unread messages (here we just simulate - in a real app you'd track this in a database)
        const unreadCount = messages.filter(m => 
          m.direction === 'inbound' && m.dateCreated > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ).length;
        
        return {
          phoneNumber,
          messages,
          lastMessageDate: lastMessage?.dateCreated || '',
          lastMessageText: lastMessage?.body || '',
          lastMessageDirection: lastMessage?.direction || 'outbound',
          unreadCount
        };
      })
      .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // If any error occurs, fallback to mock data
    const searchParams = request.nextUrl.searchParams;
    const filterNumber = searchParams.get('phoneNumber') || null;
    console.log("Error occurred. Falling back to mock data.");
    return NextResponse.json(getMockData(filterNumber));
  }
} 