import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  // Get the authentication session
  const session = await auth();
  
  // Check if NEXTAUTH_SECRET is defined (don't show the actual value for security)
  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  const hasUrl = !!process.env.NEXTAUTH_URL;
  
  // Return debug information
  return NextResponse.json({
    auth: {
      isAuthenticated: !!session,
      user: session ? {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
        role: session.user?.role,
      } : null,
    },
    env: {
      hasNextAuthSecret: hasSecret,
      hasNextAuthUrl: hasUrl,
      nodeEnv: process.env.NODE_ENV,
    },
    nextAuthVersion: '5.0.0-beta.10', // Update this if the version changes
  });
} 