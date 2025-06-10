import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll simulate a health check with hardcoded values
    // In a real implementation, this would check actual SMS Gateway status
    
    const healthData = {
      isConnected: true,
      accountActive: true,
      accountEmail: 'sean@trurankdigital.com',
      lastPing: new Date().toISOString(),
      messagesRemaining: 'unlimited',
      deviceStatus: 'online',
      apiVersion: '1.0',
      responseTime: 150,
      errors: []
    };

    // Simulate various scenarios based on query parameters (for testing)
    const scenario = request.nextUrl.searchParams.get('scenario');
    
    switch (scenario) {
      case 'offline':
        return NextResponse.json({
          isConnected: false,
          accountActive: false,
          deviceStatus: 'offline',
          error: 'SMS Gateway device is offline'
        }, { status: 503 });
        
      case 'limited':
        return NextResponse.json({
          ...healthData,
          accountActive: false,
          messagesRemaining: 0,
          error: 'Account has reached message limit'
        });
        
      case 'wrong-account':
        return NextResponse.json({
          ...healthData,
          accountEmail: 'unauthorized@example.com',
          accountActive: false,
          error: 'Unauthorized account detected'
        });
        
      default:
        // Normal healthy response
        return NextResponse.json(healthData);
    }
    
  } catch (error) {
    console.error('SMS Gateway health check error:', error);
    
    return NextResponse.json({
      isConnected: false,
      accountActive: false,
      deviceStatus: 'unknown',
      error: 'Health check service unavailable'
    }, { status: 500 });
  }
} 