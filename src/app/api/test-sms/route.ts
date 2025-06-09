import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { credentials } = data;

    if (!credentials || !credentials.apiKey || !credentials.provider) {
      return NextResponse.json({ 
        error: 'Missing credentials' 
      }, { status: 400 });
    }

    // Test SMSMobileAPI connection
    if (credentials.provider === 'smsmobile') {
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Add OAuth headers if available
      if (credentials.clientId && credentials.clientSecret) {
        headers['Authorization'] = `Bearer ${credentials.apiKey}`;
        headers['X-Client-ID'] = credentials.clientId;
        headers['X-Client-Secret'] = credentials.clientSecret;
      }

      // Test endpoint - just check if we can authenticate
      const response = await fetch('https://api.smsmobileapi.com/v1/account/balance', {
        method: 'GET',
        headers
      });

      const result = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'SMSMobileAPI connection successful',
          balance: result.balance || 'Available',
          provider: 'smsmobile'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `SMSMobileAPI error: ${result.error || result.message || 'Connection failed'}`,
          provider: 'smsmobile'
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Unsupported provider for testing' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('SMS test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Test failed' 
    }, { status: 500 });
  }
} 