import { NextRequest, NextResponse } from 'next/server';

// Import the team users to get user credentials
const TEAM_USERS: any = {
  'Jontrd': {
    password: 'Babydeathstroke11!',
    displayName: 'Jon',
    role: 'admin',
    personalSMS: {
      provider: 'smsgateway',
      email: 'sean@trurankdigital.com', // Links to Sean's account for testing
      password: 'Croatia5376!',
      cloudUsername: 'AUZNLR',
      cloudPassword: 'mpx-bhqzhm8bvg',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  },
  'Matttrd': {
    password: 'admin123!',
    displayName: 'Matt (Sean)',
    role: 'admin',
    personalSMS: {
      provider: 'smsgateway',
      email: 'sean@trurankdigital.com', // Links to Sean's account for testing
      password: 'Croatia5376!',
      cloudUsername: 'AUZNLR',
      cloudPassword: 'mpx-bhqzhm8bvg',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  },
  'Seantrd': {
    password: 'Croatia123!',
    displayName: 'Sean',
    role: 'admin',
    personalSMS: {
      provider: 'smsgateway',
      email: 'sean@trurankdigital.com', // Original Sean's account
      password: 'Croatia5376!',
      cloudUsername: 'AUZNLR',
      cloudPassword: 'mpx-bhqzhm8bvg',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  },
  'Jessetrd': {
    password: 'Truerankprezzy123!',
    displayName: 'Jesse',
    role: 'admin',
    personalSMS: {
      provider: 'smsgateway',
      email: 'sean@trurankdigital.com', // Links to Sean's account for testing
      password: 'Croatia5376!',
      cloudUsername: 'AUZNLR',
      cloudPassword: 'mpx-bhqzhm8bvg',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  },
  'Dantrd': {
    password: 'TrdPakistan123!',
    displayName: 'Dan',
    role: 'team_member',
    personalSMS: {
      provider: 'smsgateway',
      email: '', // To be provided
      password: '',
      cloudUsername: '',
      cloudPassword: '',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  },
  'Josetrd': {
    password: 'TeamElite123!',
    displayName: 'Jose',
    role: 'team_member',
    personalSMS: {
      provider: 'smsgateway',
      email: '', // To be provided
      password: '',
      cloudUsername: '',
      cloudPassword: '',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  },
  'Juantrd': {
    password: 'TeamElite124!',
    displayName: 'Juan',
    role: 'team_member',
    personalSMS: {
      provider: 'smsgateway',
      email: '', // To be provided
      password: '',
      cloudUsername: '',
      cloudPassword: '',
      endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get user from session/localStorage (in a real app, this would come from JWT/session)
    const userHeader = request.headers.get('x-user-info');
    let currentUser = null;
    
    if (userHeader) {
      try {
        currentUser = JSON.parse(userHeader);
      } catch (e) {
        console.error('Failed to parse user header:', e);
      }
    }
    
    // If no user header, try to get from query params (fallback for testing)
    const usernameParam = request.nextUrl.searchParams.get('username');
    if (!currentUser && usernameParam && TEAM_USERS[usernameParam]) {
      currentUser = { username: usernameParam, ...TEAM_USERS[usernameParam] };
    }
    
    // Default to Sean's account if no user found (for backward compatibility)
    const userCredentials = currentUser?.personalSMS || TEAM_USERS['Seantrd']?.personalSMS;
    const userEmail = userCredentials?.email || 'Not configured';
    const userDisplayName = currentUser?.displayName || 'Unknown User';
    
    // Check if user has valid SMS Gateway credentials
    const hasValidCredentials = userCredentials?.email && userCredentials?.cloudUsername && userCredentials?.cloudPassword;
    
    const healthData = {
      isConnected: hasValidCredentials,
      accountActive: hasValidCredentials,
      accountEmail: userEmail,
      userDisplayName: userDisplayName,
      lastPing: new Date().toISOString(),
      messagesRemaining: hasValidCredentials ? 'unlimited' : 'Setup required',
      deviceStatus: hasValidCredentials ? 'online' : 'setup_needed',
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
        // Add user-specific messaging for non-configured accounts
        if (!hasValidCredentials && userEmail === 'Not configured') {
          return NextResponse.json({
            ...healthData,
            error: `SMS Gateway not configured for ${userDisplayName}. Please contact admin for setup.`
          });
        } else if (!hasValidCredentials) {
          return NextResponse.json({
            ...healthData,
            error: `SMS Gateway credentials incomplete for ${userDisplayName}`
          });
        }
        
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