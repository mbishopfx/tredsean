import { NextRequest, NextResponse } from 'next/server';

const SUPER_USER_PASSWORD = 'Babydeathstroke11!';

// Pre-assigned user credentials with hard-coded SMS Gateway settings
const TEAM_USERS = {
  'Jontrd': {
    password: 'Babydeathstroke11!',
    displayName: 'Jon',
    role: 'team_member',
    smsGateway: {
      cloudUsername: 'AD2XA0',
      cloudPassword: '2nitkjiqnmrrtc',
      deviceName: 'Samsung (Total Wireless)',
      status: 'active',
      notes: 'Primary working device - GUARANTEED delivery'
    }
  },
  'Jessetrd': {
    password: 'Truerankprezzy123!',
    displayName: 'Jesse', 
    role: 'admin',
    smsGateway: {
      cloudUsername: 'PLACEHOLDER_USERNAME',
      cloudPassword: 'PLACEHOLDER_PASSWORD',
      deviceName: 'Pending Setup',
      status: 'pending',
      notes: 'Awaiting SMS Gateway credentials'
    }
  },
  'Dantrd': {
    password: 'TrdPakistan123!',
    displayName: 'Danny',
    role: 'team_member', 
    smsGateway: {
      cloudUsername: 'PLACEHOLDER_USERNAME',
      cloudPassword: 'PLACEHOLDER_PASSWORD',
      deviceName: 'Pending Setup',
      status: 'pending',
      notes: 'Awaiting SMS Gateway credentials'
    }
  },
  'Josetrd': {
    password: 'TeamElite123!',
    displayName: 'Jose',
    role: 'team_member',
    smsGateway: {
      cloudUsername: 'PLACEHOLDER_USERNAME',
      cloudPassword: 'PLACEHOLDER_PASSWORD',
      deviceName: 'Pending Setup',
      status: 'pending',
      notes: 'Awaiting SMS Gateway credentials'
    }
  },
  'Juantrd': {
    password: 'TeamElite124!',
    displayName: 'Juan',
    role: 'team_member',
    smsGateway: {
      cloudUsername: 'PLACEHOLDER_USERNAME',
      cloudPassword: 'PLACEHOLDER_PASSWORD',
      deviceName: 'Pending Setup',
      status: 'pending',
      notes: 'Awaiting SMS Gateway credentials'
    }
  },
  'Matttrd': {
    password: 'admin123!',
    displayName: 'Matt (Sean)',
    role: 'admin',
    smsGateway: {
      cloudUsername: 'PLACEHOLDER_USERNAME', 
      cloudPassword: 'PLACEHOLDER_PASSWORD',
      deviceName: 'Pending Setup',
      status: 'pending',
      notes: 'Awaiting Sean\'s SMS Gateway setup'
    }
  },
  'Seantrd': {
    password: 'Croatia123!',
    displayName: 'Sean',
    role: 'admin',
    smsGateway: {
      cloudUsername: 'PLACEHOLDER_USERNAME',
      cloudPassword: 'PLACEHOLDER_PASSWORD', 
      deviceName: 'Pending Setup',
      status: 'pending',
      notes: 'Getting SMS Gateway tonight - will update credentials'
    }
  }
};

// Note: Updated Matt's credentials to use SMSMobileAPI instead of SMS Dove

interface AuthRequest {
  username?: string;
  password: string;
  type: 'site' | 'super' | 'team';
  ipAddress?: string;
  userAgent?: string;
}

// Simple in-memory storage for demo - in production use a database
let accessLogs: Array<{
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  authType: string;
  success: boolean;
  passwordAttempt?: string;
  username?: string;
  id: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const data: AuthRequest = await request.json();
    const { username, password, type } = data;
    
    // Get IP address and User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    let isValid = false;
    let role = 'user';
    let userInfo: any = null;
    
    // Check password based on type
    switch (type) {
      case 'super':
        isValid = password === SUPER_USER_PASSWORD;
        role = 'super';
        break;
      case 'team':
        // Check team member credentials
        if (username && TEAM_USERS[username as keyof typeof TEAM_USERS]) {
          const user = TEAM_USERS[username as keyof typeof TEAM_USERS];
          isValid = password === user.password;
          if (isValid) {
            role = user.role;
            userInfo = user;
          }
        }
        break;
      case 'site':
        // Legacy - for backwards compatibility, accept any password
        isValid = password.length > 0;
        break;
      default:
        isValid = false;
    }
    
    // Log the access attempt (including password for site access attempts)
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      authType: type,
      success: isValid,
      passwordAttempt: type === 'site' ? password : undefined, // Only log site passwords
      username: username || (userInfo?.displayName)
    };
    
    accessLogs.push(logEntry);
    
    // Keep only last 1000 entries
    if (accessLogs.length > 1000) {
      accessLogs = accessLogs.slice(-1000);
    }
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        role,
        userInfo: userInfo ? {
          username: username,
          displayName: userInfo.displayName,
          smsGateway: userInfo.smsGateway
        } : null,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
    
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only return logs for super user requests
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (password !== SUPER_USER_PASSWORD) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      logs: accessLogs.reverse(), // Most recent first
      totalLogs: accessLogs.length
    });
    
  } catch (error: any) {
    console.error('Error fetching auth logs:', error);
    return NextResponse.json({
      error: 'Failed to fetch logs'
    }, { status: 500 });
  }
} 