import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Define interfaces for type safety
interface MessageData {
  phone: string;
  message: string;
}

interface SendSMSRequest {
  messages: MessageData[];
  messageText?: string;  // For backward compatibility
  phoneNumbers?: string[]; // For backward compatibility
}

export async function POST(request: NextRequest) {
  // Note: API routes don't have access to localStorage as they run on the server
  // For this simplified auth model, we'll assume all API requests are authenticated
  // In a production app, you would use proper server-side auth (tokens, sessions, etc.)

  try {
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !twilioPhone) {
      return NextResponse.json({ 
        error: 'Twilio configuration missing. Please check environment variables.' 
      }, { status: 500 });
    }
    
    // Initialize Twilio client
    const client = twilio(accountSid, authToken);
    
    // Get request data
    const data: SendSMSRequest = await request.json();
    
    let messagesToSend: MessageData[] = [];
    
    // Handle both new and old format for backward compatibility
    if (data.messages && Array.isArray(data.messages)) {
      // New format with personalized messages
      messagesToSend = data.messages;
    } else if (data.messageText && data.phoneNumbers && Array.isArray(data.phoneNumbers)) {
      // Old format with single message for all recipients
      messagesToSend = data.phoneNumbers.map(phone => ({
        phone,
        message: data.messageText as string
      }));
    } else {
      return NextResponse.json({ 
        error: 'Invalid request format. Expected messages array or messageText and phoneNumbers.' 
      }, { status: 400 });
    }
    
    // Check if we have any messages to send
    if (messagesToSend.length === 0) {
      return NextResponse.json({ 
        error: 'No valid messages to send.' 
      }, { status: 400 });
    }
    
    console.log(`Sending ${messagesToSend.length} SMS messages...`);
    
    // Send messages in parallel
    const results = await Promise.all(
      messagesToSend.map(async ({ phone, message }) => {
        try {
          // Format phone number - Twilio expects E.164 format
          let formattedPhone = phone.trim();
          
          // Add + prefix if missing and not working with a short code
          if (!formattedPhone.startsWith('+') && formattedPhone.length > 6) {
            // If US/CA number without country code (10 digits)
            if (/^\d{10}$/.test(formattedPhone)) {
              formattedPhone = `+1${formattedPhone}`;
            } 
            // If already has country code but missing + (11+ digits starting with 1)
            else if (/^1\d{10,}$/.test(formattedPhone)) {
              formattedPhone = `+${formattedPhone}`;
            }
            // Other international format but missing +
            else if (/^\d{11,}$/.test(formattedPhone)) {
              formattedPhone = `+${formattedPhone}`;
            }
          }
          
          // Remove any remaining non-numeric characters except the + prefix
          formattedPhone = formattedPhone.startsWith('+') 
            ? '+' + formattedPhone.substring(1).replace(/\D/g, '')
            : formattedPhone.replace(/\D/g, '');
          
          console.log(`Sending to ${formattedPhone}: ${message.substring(0, 30)}...`);
          
          // Send message via Twilio
          const smsResponse = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedPhone
          });
          
          return {
            phone: formattedPhone,
            success: true,
            sid: smsResponse.sid,
            status: smsResponse.status,
          };
        } catch (error: any) {
          console.error(`Error sending SMS to ${phone}:`, error.message);
          return {
            phone,
            success: false,
            error: error.message
          };
        }
      })
    );
    
    // Count successful and failed messages
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${successful} message(s), ${failed} failed.`,
      results
    });
    
  } catch (error: any) {
    console.error('Error in SMS API:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while sending SMS messages.' 
    }, { status: 500 });
  }
} 