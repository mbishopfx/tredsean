import { Twilio } from 'twilio';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messageText, toPhoneNumber } = await request.json();

    if (!messageText || !toPhoneNumber) {
      return NextResponse.json({ error: 'Message text and recipient phone number are required' }, { status: 400 });
    }

    // Initialize Twilio client with environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const client = new Twilio(accountSid, authToken);
    
    // Send the message
    const message = await client.messages.create({
      body: messageText,
      from: twilioPhoneNumber,
      to: toPhoneNumber,
    });
    
    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
      dateCreated: message.dateCreated?.toISOString(),
      from: message.from,
      to: message.to,
      body: message.body
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while sending the message' },
      { status: 500 }
    );
  }
} 