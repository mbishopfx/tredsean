import { NextRequest, NextResponse } from 'next/server';

interface MessageData {
  phone: string;
  message: string;
}

interface PersonalSMSCredentials {
  apiKey?: string;
  deviceId?: string;
  provider: 'smsmobile' | 'smsdove' | 'smsgateway';
  token?: string;
  accountId?: string;
  accessCode?: string;
  clientId?: string;
  clientSecret?: string;
  // SMS Gateway credentials
  username?: string;
  password?: string;
  cloudUsername?: string; // From auth system
  cloudPassword?: string; // From auth system
  endpoint?: string; // for private instances
}

interface SendSMSRequest {
  messages: MessageData[];
  credentials: PersonalSMSCredentials;
  messageText?: string;
  phoneNumbers?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: SendSMSRequest = await request.json();
    
    // Extract credentials from request
    const { credentials } = data;
    
    if (!credentials || !credentials.provider) {
      return NextResponse.json({ 
        error: 'Personal SMS credentials required. Please provide provider and appropriate credentials.' 
      }, { status: 400 });
    }
    
    let messagesToSend: MessageData[] = [];
    
    // Handle both message formats for compatibility
    if (data.messages && Array.isArray(data.messages)) {
      messagesToSend = data.messages;
    } else if (data.messageText && data.phoneNumbers && Array.isArray(data.phoneNumbers)) {
      messagesToSend = data.phoneNumbers.map(phone => ({
        phone,
        message: data.messageText as string
      }));
    } else {
      return NextResponse.json({ 
        error: 'Invalid request format. Expected messages array or messageText and phoneNumbers.' 
      }, { status: 400 });
    }

    if (messagesToSend.length === 0) {
      return NextResponse.json({ 
        error: 'No valid messages to send.' 
      }, { status: 400 });
    }

    console.log(`Sending ${messagesToSend.length} SMS messages via ${credentials.provider}...`);
    
    // Send messages through personal SMS gateway
    const results = await Promise.all(
      messagesToSend.map(async ({ phone, message }) => {
        try {
          let requestBody: any;
          let endpoint: string;
          let headers: any = {};

          if (credentials.provider === 'smsmobile') {
            // SMSMobileAPI correct format - based on official documentation
            endpoint = 'https://api.smsmobileapi.com/sendsms/';
            
            // Use form-urlencoded format as per documentation
            headers = {
              'Content-Type': 'application/x-www-form-urlencoded'
            };
            
            // Add OAuth headers if client credentials are provided
            if (credentials.clientId && credentials.clientSecret) {
              headers['Authorization'] = `Bearer ${credentials.apiKey}`;
              headers['X-Client-ID'] = credentials.clientId;
              headers['X-Client-Secret'] = credentials.clientSecret;
            }
            
            // Create form data as per SMSMobileAPI documentation
            const formData = new URLSearchParams();
            formData.append('recipients', phone);
            formData.append('message', message);
            formData.append('apikey', credentials.apiKey);
            
            requestBody = formData;
          } else if (credentials.provider === 'smsgateway') {
            // SMS Gateway format - open source solution
            endpoint = credentials.endpoint || 'https://api.sms-gate.app/3rdparty/v1/message';
            
            // Handle both credential formats: cloudUsername/cloudPassword OR username/password
            const gatewayUsername = credentials.cloudUsername || credentials.username;
            const gatewayPassword = credentials.cloudPassword || credentials.password;
            
            if (!gatewayUsername || !gatewayPassword) {
              throw new Error('SMS Gateway requires username and password (or cloudUsername and cloudPassword)');
            }
            
            headers = {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${gatewayUsername as string}:${gatewayPassword as string}`).toString('base64')}`
            };
            
            requestBody = {
              message: message,
              phoneNumbers: [phone]
            };
          } else if (credentials.provider === 'smsdove') {
            // SMS Dove format - based on official API documentation
            if (!credentials.token || !credentials.accountId) {
              throw new Error('SMS Dove requires token and accountId');
            }
            
            headers = {
              'Content-Type': 'application/json',
              'Authorization': `token ${credentials.token}`
            };
            
            endpoint = `https://api.smsdove.com/v1/account/${credentials.accountId}/sms`;
            requestBody = {
              To: phone,
              Msg: message
            };
          } else {
            throw new Error(`Unsupported provider: ${credentials.provider}`);
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: credentials.provider === 'smsmobile' ? requestBody : JSON.stringify(requestBody),
          });
          
          // Handle different response formats
          let result;
          const responseText = await response.text();
          
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            // SMSMobileAPI may return plain text, handle that
            result = { 
              raw: responseText, 
              success: responseText.includes('success') || responseText.includes('sent') || responseText.includes('OK') || response.ok
            };
          }
          
          if (response.ok || result.success || responseText.includes('success') || responseText.includes('sent') || responseText.includes('OK')) {
            return {
              phone,
              success: true,
              messageId: result.messageId || result.guid || result.id || 'sent',
              status: 'sent',
              provider: credentials.provider
            };
                      } else {
              throw new Error(result.error || result.message || responseText.substring(0, 200) || 'Failed to send SMS');
            }
        } catch (error: any) {
          console.error(`Error sending SMS to ${phone} via ${credentials.provider}:`, error.message);
          return {
            phone,
            success: false,
            error: error.message,
            provider: credentials.provider
          };
        }
      })
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${successful} message(s), ${failed} failed via ${credentials.provider}.`,
      results,
      provider: credentials.provider
    });
    
  } catch (error: any) {
    console.error('Error in Personal SMS API:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while sending SMS messages.' 
    }, { status: 500 });
  }
} 