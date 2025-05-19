import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get form data from Twilio - this includes details about the call
    const formData = await request.formData();
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;
    const callSid = formData.get('CallSid') as string;
    
    console.log(`Handling call from ${from} to ${to} with SID: ${callSid}`);
    
    // Basic TwiML response that says a message then ends the call
    const twiml = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">This is a call from TRD Dialer. Please wait while we connect you.</Say>
  <Pause length="2"/>
  <Say voice="alice">Your call is important to us. Please continue to hold.</Say>
  <Pause length="2"/>
  <!-- In a real implementation, you might use a <Dial> verb to connect to another number -->
</Response>`;
    
    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    
    // Return a minimal error TwiML in case of failure
    const errorTwiml = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, an error occurred while processing your call.</Say>
</Response>`;
    
    return new NextResponse(errorTwiml, {
      status: 200, // Still return 200 so Twilio can process the TwiML
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
} 