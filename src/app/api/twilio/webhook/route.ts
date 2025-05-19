import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    
    // Extract key details from the Twilio webhook
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;
    
    // Log the status update
    console.log(`Message ${messageSid} to ${to} status: ${messageStatus}`);
    
    // Here you would typically store this information in a database
    // For now, we're just logging it
    
    // Future enhancement: Store in a database and update the UI

    return NextResponse.json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 