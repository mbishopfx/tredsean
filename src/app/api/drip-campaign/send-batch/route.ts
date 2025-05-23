import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ScheduledMessage {
  id: string;
  campaignId: string;
  contactPhone: string;
  contactName: string;
  messageText: string;
  templateDay: number;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  twilioSid?: string;
  error?: string;
}

// File paths for persistent storage
const MESSAGES_FILE = path.join(process.cwd(), 'data', 'drip-messages.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read/write scheduled messages
const getScheduledMessages = (): ScheduledMessage[] => {
  ensureDataDir();
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scheduled messages:', error);
    return [];
  }
};

const saveScheduledMessages = (messages: ScheduledMessage[]) => {
  ensureDataDir();
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving scheduled messages:', error);
    throw error;
  }
};

// Send SMS via Twilio
const sendSMSViaTwilio = async (phoneNumber: string, messageText: string): Promise<{success: boolean, sid?: string, error?: string}> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/twilio/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          phone: phoneNumber,
          message: messageText
        }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send SMS');
    }

    // Extract result for the single message
    const result = data.results?.[0];
    
    if (result?.success) {
      return {
        success: true,
        sid: result.sid
      };
    } else {
      return {
        success: false,
        error: result?.error || 'Unknown SMS sending error'
      };
    }

  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Process due messages
const processDueMessages = async (): Promise<{processed: number, sent: number, failed: number}> => {
  const messages = getScheduledMessages();
  const now = new Date();
  
  // Find messages that are due to be sent
  const dueMessages = messages.filter(msg => 
    msg.status === 'scheduled' && 
    new Date(msg.scheduledFor) <= now
  );

  console.log(`📧 Processing ${dueMessages.length} due messages...`);

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const message of dueMessages) {
    processed++;
    
    console.log(`📱 Sending message ${processed}/${dueMessages.length}: ${message.contactName} (${message.contactPhone})`);

    // Send the message via Twilio
    const result = await sendSMSViaTwilio(message.contactPhone, message.messageText);
    
    if (result.success) {
      // Update message status to sent
      message.status = 'sent';
      message.sentAt = new Date().toISOString();
      message.twilioSid = result.sid;
      sent++;
      
      console.log(`✅ Message sent successfully to ${message.contactName} - SID: ${result.sid}`);
    } else {
      // Update message status to failed
      message.status = 'failed';
      message.error = result.error;
      failed++;
      
      console.log(`❌ Failed to send message to ${message.contactName}: ${result.error}`);
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save updated messages back to storage
  if (processed > 0) {
    saveScheduledMessages(messages);
  }

  return { processed, sent, failed };
};

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting drip campaign message batch processing...');
    
    const stats = await processDueMessages();
    
    console.log(`📊 Batch processing completed:`);
    console.log(`   - Processed: ${stats.processed} messages`);
    console.log(`   - Sent: ${stats.sent} messages`);
    console.log(`   - Failed: ${stats.failed} messages`);

    return NextResponse.json({
      success: true,
      message: `Processed ${stats.processed} messages. ${stats.sent} sent, ${stats.failed} failed.`,
      stats
    });

  } catch (error) {
    console.error('Error processing drip campaign messages:', error);
    return NextResponse.json(
      { error: 'Failed to process drip campaign messages' },
      { status: 500 }
    );
  }
}

// GET endpoint to check pending messages
export async function GET(request: NextRequest) {
  try {
    const messages = getScheduledMessages();
    const now = new Date();
    
    const dueMessages = messages.filter(msg => 
      msg.status === 'scheduled' && 
      new Date(msg.scheduledFor) <= now
    );

    const upcomingMessages = messages.filter(msg => 
      msg.status === 'scheduled' && 
      new Date(msg.scheduledFor) > now
    );

    const sentMessages = messages.filter(msg => msg.status === 'sent' || msg.status === 'delivered');
    const failedMessages = messages.filter(msg => msg.status === 'failed');

    return NextResponse.json({
      success: true,
      summary: {
        dueNow: dueMessages.length,
        upcoming: upcomingMessages.length,
        sent: sentMessages.length,
        failed: failedMessages.length,
        total: messages.length
      },
      dueMessages: dueMessages.slice(0, 10), // Show first 10 due messages
      nextDueDate: upcomingMessages.length > 0 
        ? upcomingMessages.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())[0].scheduledFor
        : null
    });

  } catch (error) {
    console.error('Error checking drip campaign messages:', error);
    return NextResponse.json(
      { error: 'Failed to check drip campaign messages' },
      { status: 500 }
    );
  }
} 