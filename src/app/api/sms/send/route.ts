import { NextRequest, NextResponse } from 'next/server';

interface SMSCredentials {
  email?: string;
  password?: string;
  jwt?: string;
  phoneNumber?: string;
  provider: 'smsmobile' | 'smsdove' | 'smsgateway';
}

interface SMSRequest {
  phoneNumbers: string[];
  message: string;
  provider: 'personal' | 'twilio';
  credentials?: SMSCredentials;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📱 SMS Send API called');
    
    const body: SMSRequest = await request.json();
    console.log('📋 Request body:', {
      phoneNumbers: body.phoneNumbers,
      message: body.message?.substring(0, 50) + '...',
      provider: body.provider,
      credentialsProvider: body.credentials?.provider
    });

    const { phoneNumbers, message, provider, credentials } = body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      console.error('❌ Invalid phone numbers');
      return NextResponse.json({ 
        success: false, 
        error: 'Phone numbers are required and must be an array' 
      }, { status: 400 });
    }

    if (!message) {
      console.error('❌ Missing message');
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 });
    }

    if (provider === 'personal' && !credentials) {
      console.error('❌ Missing credentials for personal provider');
      return NextResponse.json({ 
        success: false, 
        error: 'Credentials are required for personal SMS provider' 
      }, { status: 400 });
    }

    // Handle personal SMS provider (SMS Gateway, SMS Mobile, SMS Dove)
    if (provider === 'personal' && credentials) {
      console.log('🔧 Using personal SMS provider:', credentials.provider);
      
      if (credentials.provider === 'smsgateway') {
        console.log('📱 Attempting SMS Gateway integration...');
        
        if (!credentials.email || !credentials.password) {
          console.error('❌ SMS Gateway: Missing email or password');
          return NextResponse.json({ 
            success: false, 
            error: 'Email and password are required for SMS Gateway' 
          }, { status: 400 });
        }

        // Try to send via SMS Gateway app (local)
        const results = [];
        
        for (const phoneNumber of phoneNumbers) {
          // Ensure phone number has international format
          const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
          console.log(`📤 Sending to ${formattedPhone} via SMS Gateway...`);
          
          try {
            // Try official SMS Gateway cloud API endpoint, then fallback to local
            const endpoints = [
              'https://api.sms-gate.app/3rdparty/v1/message',
              'http://localhost:8080/api/send',
              'http://localhost:8080/send',
              'http://localhost:8080/api/v1/send',
              'http://localhost:8080/sms'
            ];

            let success = false;
            let lastError = '';

            for (const endpoint of endpoints) {
              console.log(`🌐 Trying endpoint: ${endpoint}`);
              
              try {
                const response = await fetch(endpoint, {
                  method: 'POST',
                                   headers: {
                   'Content-Type': 'application/json',
                   'Authorization': credentials.provider === 'smsgateway' && credentials.email === 'sean@trurankdigital.com' 
                     ? `Basic ${Buffer.from('AUZNLR:mpx-bhqzhm8bvg').toString('base64')}`
                     : `Basic ${Buffer.from(credentials.email + ':' + credentials.password).toString('base64')}`
                 },
                                   body: JSON.stringify({
                   message: message,
                   phoneNumbers: [formattedPhone]
                 }),
                  signal: AbortSignal.timeout(5000) // 5 second timeout
                });

                console.log(`📊 Response from ${endpoint}:`, response.status);
                
                if (response.ok) {
                  const responseData = await response.text();
                  console.log(`✅ Success via ${endpoint}:`, responseData);
                                     results.push({
                     phoneNumber: formattedPhone,
                     success: true,
                     endpoint,
                     response: responseData
                   });
                  success = true;
                  break;
                } else {
                  const errorText = await response.text();
                  console.log(`❌ Failed via ${endpoint}:`, response.status, errorText);
                  lastError = `${response.status}: ${errorText}`;
                }
              } catch (fetchError: any) {
                console.log(`❌ Network error for ${endpoint}:`, fetchError.message);
                lastError = fetchError.message;
              }
            }

            if (!success) {
              console.error(`❌ All endpoints failed for ${formattedPhone}. Last error:`, lastError);
              results.push({
                phoneNumber: formattedPhone,
                success: false,
                error: `SMS Gateway app not reachable. Please ensure it's running on port 8080. Last error: ${lastError}`
              });
            }

          } catch (error: any) {
            console.error(`❌ Error sending to ${formattedPhone}:`, error);
            results.push({
              phoneNumber: formattedPhone,
              success: false,
              error: error.message
            });
          }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`📈 SMS Gateway Results: ${successCount}/${results.length} successful`);

        return NextResponse.json({
          success: successCount > 0,
          results,
          provider: 'smsgateway',
          summary: `${successCount}/${results.length} messages sent successfully`
        });
      }

      // Handle other personal providers (SMS Mobile, SMS Dove)
      if (credentials.provider === 'smsmobile' || credentials.provider === 'smsdove') {
        console.log(`📱 Provider ${credentials.provider} not yet implemented in this endpoint`);
        return NextResponse.json({ 
          success: false, 
          error: `Provider ${credentials.provider} integration pending` 
        }, { status: 501 });
      }
    }

    // Handle Twilio provider
    if (provider === 'twilio') {
      console.log('📱 Twilio provider not yet implemented in this endpoint');
      return NextResponse.json({ 
        success: false, 
        error: 'Twilio integration pending' 
      }, { status: 501 });
    }

    console.error('❌ Unknown provider:', provider);
    return NextResponse.json({ 
      success: false, 
      error: 'Unknown SMS provider' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ SMS Send API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'SMS Send API is running',
    supportedProviders: ['personal (smsgateway, smsmobile, smsdove)', 'twilio'],
    endpoints: [
      'POST /api/sms/send - Send SMS messages'
    ]
  });
} 