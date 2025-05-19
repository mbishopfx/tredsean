import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET(request: NextRequest) {
  try {
    // Get identity from auth (simplified here)
    // In a real app, you'd get the user's identity from the session
    const identity = 'user'; 
    
    // Get Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }
    
    // For production, you'd want to create a TwiML app and use its SID
    // For now, we'll use the account SID
    const appSid = accountSid;
    
    // Create access token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    
    const token = new AccessToken(
      accountSid,
      authToken,
      appSid,
      { identity: identity }
    );
    
    // Create a Voice grant for this token
    const grant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true,
    });
    
    token.addGrant(grant);
    
    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 