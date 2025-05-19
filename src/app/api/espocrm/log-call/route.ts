import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Note: API routes don't have access to localStorage as they run on the server
  // For this simplified auth model, we'll assume all API requests are authenticated
  // In a production app, you would use proper server-side auth (tokens, sessions, etc.)

  try {
    const { phoneNumber, outcome, notes, contactInfo } = await request.json();

    if (!phoneNumber || !outcome) {
      return NextResponse.json({ error: 'Phone number and outcome are required' }, { status: 400 });
    }

    // Check EspoCRM credentials from environment variables
    const espoCrmUrl = process.env.ESPO_CRM_URL;
    const espoCrmApiKey = process.env.ESPO_CRM_API_KEY;

    if (!espoCrmUrl || !espoCrmApiKey) {
      return NextResponse.json({ error: 'EspoCRM credentials not configured' }, { status: 500 });
    }

    // Contact ID can be null/undefined if no match was found
    const contactId = contactInfo?.id;

    // This would be a real API call to EspoCRM in production
    // For now, let's simulate a successful call log
    // const espoResponse = await fetch(`${espoCrmUrl}/api/v1/Activities`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Api-Key': espoCrmApiKey,
    //   },
    //   body: JSON.stringify({
    //     type: 'Call',
    //     subject: `Call with ${contactInfo?.name || phoneNumber}`,
    //     status: mapOutcomeToStatus(outcome),
    //     dateStart: new Date().toISOString(),
    //     description: notes,
    //     parentType: contactId ? 'Contact' : null,
    //     parentId: contactId || null,
    //     phoneNumber: phoneNumber,
    //     direction: 'Outbound',
    //     assignedUserId: 'current-user', // Previously session.user.id
    //   }),
    // });
    // 
    // const data = await espoResponse.json();
    // 
    // if (!espoResponse.ok) {
    //   throw new Error(data.message || 'Failed to log call to EspoCRM');
    // }

    // For demo purposes, return a simulated success response
    return NextResponse.json({
      success: true,
      message: 'Call logged successfully',
      activity: {
        id: `activity-${Date.now()}`,
        type: 'Call',
        subject: `Call with ${contactInfo?.name || phoneNumber}`,
        status: mapOutcomeToStatus(outcome),
        dateStart: new Date().toISOString(),
        parentType: contactId ? 'Contact' : null,
        parentId: contactId || null,
      }
    });
  } catch (error) {
    console.error('Error logging call to EspoCRM:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to log call to EspoCRM' },
      { status: 500 }
    );
  }
}

// Helper function to map our outcome options to EspoCRM status values
function mapOutcomeToStatus(outcome: string): string {
  switch (outcome) {
    case 'Answered - Interested':
    case 'Answered - Call Back Later':
      return 'Held';
    case 'Answered - Not Interested':
    case 'Answered - No Follow Up':
    case 'Voicemail Left':
      return 'Completed';
    case 'No Answer':
    case 'Wrong Number':
    case 'Hang Up':
    case 'Busy Signal':
    case 'Out of Service':
      return 'Not Held';
    default:
      return 'Completed';
  }
} 