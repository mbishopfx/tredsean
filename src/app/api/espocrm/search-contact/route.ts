import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Note: API routes don't have access to localStorage as they run on the server
  // For this simplified auth model, we'll assume all API requests are authenticated
  // In a production app, you would use proper server-side auth (tokens, sessions, etc.)

  try {
    // Get the phone number from query params
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Check EspoCRM credentials from environment variables
    const espoCrmUrl = process.env.ESPO_CRM_URL;
    const espoCrmApiKey = process.env.ESPO_CRM_API_KEY;

    if (!espoCrmUrl || !espoCrmApiKey) {
      return NextResponse.json({ error: 'EspoCRM credentials not configured' }, { status: 500 });
    }

    // This would be a real API call to EspoCRM in production
    // For now, let's simulate finding a contact based on some patterns
    // const espoResponse = await fetch(`${espoCrmUrl}/api/v1/Contact?where[phoneNumber]=${encodeURIComponent(phoneNumber)}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Api-Key': espoCrmApiKey,
    //   },
    // });
    // 
    // const data = await espoResponse.json();
    // 
    // if (!espoResponse.ok) {
    //   throw new Error(data.message || 'Failed to search contacts in EspoCRM');
    // }
    
    // Mock response for demo purposes
    let contact = null;
    
    // Simple phone number pattern matching for demo
    if (phoneNumber.endsWith('1234')) {
      contact = {
        id: 'contact-123',
        name: 'John Doe',
        phoneNumber: phoneNumber,
        email: 'john.doe@example.com',
        accountName: 'Acme Corp',
      };
    } else if (phoneNumber.endsWith('5678')) {
      contact = {
        id: 'contact-456',
        name: 'Jane Smith',
        phoneNumber: phoneNumber,
        email: 'jane.smith@example.com',
        accountName: 'ABC Company',
      };
    } else if (phoneNumber.endsWith('9999')) {
      contact = {
        id: 'contact-789',
        name: 'Bob Johnson',
        phoneNumber: phoneNumber,
        email: 'bob.johnson@example.com',
        accountName: 'XYZ Inc',
      };
    }
    
    return NextResponse.json({
      success: true,
      contact: contact,
    });
  } catch (error) {
    console.error('Error searching contacts in EspoCRM:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search contacts in EspoCRM' },
      { status: 500 }
    );
  }
} 