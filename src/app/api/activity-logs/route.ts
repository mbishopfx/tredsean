import { NextRequest, NextResponse } from 'next/server';
import { getRecentLogs, getUserLogs, logActivity } from '@/app/lib/activity-logger';

// GET endpoint to retrieve activity logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const limitParam = searchParams.get('limit');
    
    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    
    // If username is provided, get logs for that specific user
    const logs = username 
      ? await getUserLogs(username, limit)
      : await getRecentLogs(limit);
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error retrieving activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve activity logs' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new activity log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, action, details } = body;
    
    if (!user || !action) {
      return NextResponse.json(
        { error: 'User and action are required' },
        { status: 400 }
      );
    }
    
    await logActivity(user, action, details);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
} 