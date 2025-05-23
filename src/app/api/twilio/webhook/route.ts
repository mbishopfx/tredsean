import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Webhook event data interface
interface TwilioWebhookEvent {
  MessageSid: string;
  MessageStatus: string;
  To: string;
  From: string;
  Body?: string;
  Direction?: string;
  EventType?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  Timestamp?: string;
}

// Analytics storage
const analyticsFile = join(process.cwd(), 'message-analytics.json');
const webhookLogFile = join(process.cwd(), 'webhook-events.json');

function getStoredAnalytics() {
  try {
    if (existsSync(analyticsFile)) {
      const data = readFileSync(analyticsFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading analytics file:', error);
  }
  return [];
}

function storeAnalytics(analytics: any[]) {
  try {
    writeFileSync(analyticsFile, JSON.stringify(analytics, null, 2));
  } catch (error) {
    console.error('Error writing analytics file:', error);
  }
}

function logWebhookEvent(event: TwilioWebhookEvent) {
  try {
    let events = [];
    if (existsSync(webhookLogFile)) {
      events = JSON.parse(readFileSync(webhookLogFile, 'utf8'));
    }
    
    events.push({
      ...event,
      receivedAt: new Date().toISOString()
    });
    
    // Keep only last 1000 webhook events to prevent file from getting too large
    if (events.length > 1000) {
      events = events.slice(-1000);
    }
    
    writeFileSync(webhookLogFile, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const formData = await request.formData();
    const webhookData: TwilioWebhookEvent = {
      MessageSid: formData.get('MessageSid') as string,
      MessageStatus: formData.get('MessageStatus') as string,
      To: formData.get('To') as string,
      From: formData.get('From') as string,
      Body: formData.get('Body') as string,
      Direction: formData.get('Direction') as string,
      EventType: formData.get('EventType') as string,
      ErrorCode: formData.get('ErrorCode') as string,
      ErrorMessage: formData.get('ErrorMessage') as string,
      Timestamp: formData.get('Timestamp') as string
    };

    console.log('📨 Twilio Webhook Received:', {
      sid: webhookData.MessageSid,
      status: webhookData.MessageStatus,
      direction: webhookData.Direction,
      to: webhookData.To,
      from: webhookData.From
    });

    // Log the webhook event
    logWebhookEvent(webhookData);

    // Update our analytics with real-time status updates
    const analytics = getStoredAnalytics();
    const messageIndex = analytics.findIndex((msg: any) => msg.sid === webhookData.MessageSid);
    
    if (messageIndex !== -1) {
      // Update existing message
      analytics[messageIndex] = {
        ...analytics[messageIndex],
        status: webhookData.MessageStatus,
        dateUpdated: new Date().toISOString(),
        errorCode: webhookData.ErrorCode || analytics[messageIndex].errorCode,
        errorMessage: webhookData.ErrorMessage || analytics[messageIndex].errorMessage,
        lastWebhookEvent: webhookData.EventType || 'status_update'
      };
      
      // Increment delivery attempts for failed messages
      if (['failed', 'undelivered'].includes(webhookData.MessageStatus)) {
        analytics[messageIndex].deliveryAttempts = (analytics[messageIndex].deliveryAttempts || 1) + 1;
      }
      
      console.log('✅ Updated message analytics for SID:', webhookData.MessageSid);
    } else {
      // New message from webhook (inbound message)
      if (webhookData.Direction === 'inbound') {
        analytics.push({
          sid: webhookData.MessageSid,
          to: webhookData.To,
          from: webhookData.From,
          body: webhookData.Body || '',
          status: webhookData.MessageStatus,
          direction: 'inbound',
          dateSent: new Date().toISOString(),
          dateCreated: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
          price: null,
          errorCode: webhookData.ErrorCode,
          errorMessage: webhookData.ErrorMessage,
          numSegments: '1',
          deliveryAttempts: 1,
          replyReceived: true,
          isWebhookMessage: true
        });
        
        console.log('📥 Added new inbound message:', webhookData.MessageSid);
      }
    }

    // Save updated analytics
    storeAnalytics(analytics);

    // Additional webhook event processing
    const eventProcessing = {
      delivered: () => {
        console.log('✅ Message delivered successfully:', webhookData.MessageSid);
        // Could trigger success notifications or update campaign progress
      },
      failed: () => {
        console.log('❌ Message delivery failed:', webhookData.MessageSid, webhookData.ErrorMessage);
        // Could trigger retry logic or alert notifications
      },
      undelivered: () => {
        console.log('⚠️ Message undelivered:', webhookData.MessageSid, webhookData.ErrorMessage);
        // Could mark contact as invalid or trigger alternative contact method
      },
      received: () => {
        console.log('📨 Reply received from:', webhookData.From);
        // Could trigger auto-responder or add to priority queue
      }
    };

    // Process based on message status
    const processor = eventProcessing[webhookData.MessageStatus as keyof typeof eventProcessing];
    if (processor) {
      processor();
    }

    // Return success response to Twilio
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      messageId: webhookData.MessageSid,
      status: webhookData.MessageStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing Twilio webhook:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook URL validation
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Twilio webhook endpoint is active',
    timestamp: new Date().toISOString(),
    endpoint: '/api/twilio/webhook',
    methods: ['POST'],
    description: 'Receives Twilio message status updates and delivery confirmations'
  });
} 