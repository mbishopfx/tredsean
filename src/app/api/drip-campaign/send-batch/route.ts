import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

interface BatchSendRequest {
  campaignId: string;
  messageTemplate: {
    day: number;
    message: string;
  };
  contacts: Array<{
    phone: string;
    name?: string;
    company?: string;
    email?: string;
    location?: string;
    [key: string]: any;
  }>;
}

// Function to replace template variables in message
const replaceVariables = (template: string, contact: any): string => {
  let personalizedMessage = template;
  
  // Replace common variables
  personalizedMessage = personalizedMessage.replace(/{name}/g, contact.name || "there");
  personalizedMessage = personalizedMessage.replace(/{company}/g, contact.company || "");
  personalizedMessage = personalizedMessage.replace(/{phone}/g, contact.phone || "");
  personalizedMessage = personalizedMessage.replace(/{email}/g, contact.email || "");
  personalizedMessage = personalizedMessage.replace(/{location}/g, contact.location || "");
  
  // Replace date/time variables
  personalizedMessage = personalizedMessage.replace(/{date}/g, new Date().toLocaleDateString());
  personalizedMessage = personalizedMessage.replace(/{time}/g, new Date().toLocaleTimeString());
  
  // Replace any other custom variables
  Object.keys(contact).forEach(key => {
    if (key.startsWith('custom_')) {
      const variableName = key.replace('custom_', '');
      personalizedMessage = personalizedMessage.replace(
        new RegExp(`{${variableName}}`, 'g'), 
        contact[key] || ""
      );
    }
  });
  
  return personalizedMessage;
};

export async function POST(request: NextRequest) {
  try {
    const data: BatchSendRequest = await request.json();
    
    // Validate required fields
    if (!data.campaignId || !data.messageTemplate || !data.contacts) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, messageTemplate, or contacts' },
        { status: 400 }
      );
    }
    
    if (data.contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts provided' },
        { status: 400 }
      );
    }
    
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('Twilio configuration missing, using mock response');
      // Return mock success for testing
      return NextResponse.json({
        success: true,
        message: `Mock: Would send ${data.contacts.length} messages for campaign ${data.campaignId}`,
        results: data.contacts.map(contact => ({
          phone: contact.phone,
          success: true,
          sid: `mock_${Date.now()}_${Math.random()}`,
          status: 'queued'
        })),
        summary: {
          total: data.contacts.length,
          successful: data.contacts.length,
          failed: 0,
          campaignId: data.campaignId,
          messageDay: data.messageTemplate.day
        }
      });
    }
    
    // Initialize Twilio client
    const client = twilio(accountSid, authToken);
    
    // Prepare personalized messages
    const messages = data.contacts.map(contact => {
      const personalizedMessage = replaceVariables(data.messageTemplate.message, contact);
      
      return {
        phone: contact.phone,
        message: personalizedMessage,
        contactName: contact.name || 'Unknown'
      };
    });
    
    console.log(`Sending ${messages.length} drip campaign messages for campaign ${data.campaignId}, day ${data.messageTemplate.day}`);
    
    // Send messages in parallel using existing Twilio infrastructure
    const results = await Promise.all(
      messages.map(async ({ phone, message, contactName }) => {
        try {
          // Format phone number for Twilio
          let formattedPhone = phone.trim();
          
          if (!formattedPhone.startsWith('+') && formattedPhone.length > 6) {
            if (/^\d{10}$/.test(formattedPhone)) {
              formattedPhone = `+1${formattedPhone}`;
            } else if (/^1\d{10,}$/.test(formattedPhone)) {
              formattedPhone = `+${formattedPhone}`;
            } else if (/^\d{11,}$/.test(formattedPhone)) {
              formattedPhone = `+${formattedPhone}`;
            }
          }
          
          formattedPhone = formattedPhone.startsWith('+') 
            ? '+' + formattedPhone.substring(1).replace(/\D/g, '')
            : formattedPhone.replace(/\D/g, '');
          
          console.log(`Sending drip message to ${contactName} (${formattedPhone}): ${message.substring(0, 50)}...`);
          
          // Send message via Twilio
          const smsResponse = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedPhone
          });
          
          return {
            phone: formattedPhone,
            contactName,
            success: true,
            sid: smsResponse.sid,
            status: smsResponse.status,
            campaignId: data.campaignId,
            messageDay: data.messageTemplate.day
          };
        } catch (error: any) {
          console.error(`Error sending drip message to ${contactName} (${phone}):`, error.message);
          return {
            phone,
            contactName,
            success: false,
            error: error.message,
            campaignId: data.campaignId,
            messageDay: data.messageTemplate.day
          };
        }
      })
    );
    
    // Count successful and failed messages
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`Drip campaign batch complete: ${successful} sent, ${failed} failed for campaign ${data.campaignId}`);
    
    return NextResponse.json({
      success: true,
      message: `Drip campaign messages sent: ${successful} successful, ${failed} failed`,
      results,
      summary: {
        total: results.length,
        successful,
        failed,
        campaignId: data.campaignId,
        messageDay: data.messageTemplate.day
      }
    });
    
  } catch (error: any) {
    console.error('Error in drip campaign batch send:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while sending drip campaign messages.' 
    }, { status: 500 });
  }
} 