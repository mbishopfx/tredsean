import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, formatPhoneNumber, handleCloseApiError } from '../utils';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, outcome, notes, contactInfo } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!outcome) {
      return NextResponse.json({ error: 'Call outcome is required' }, { status: 400 });
    }

    const client = getCloseClient();
    let leadId = contactInfo?.leadId || null;
    
    // If we don't have a lead ID but have contact info with an ID, try to get the lead ID
    if (!leadId && contactInfo?.id) {
      try {
        const contactResponse = await client.get(`/contact/${contactInfo.id}`);
        leadId = contactResponse.data.lead_id;
      } catch (error) {
        console.error('Error fetching contact:', error);
      }
    }
    
    // If we still don't have a lead ID, search for lead by phone number
    if (!leadId) {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      
      try {
        const leadResponse = await client.get('/lead', {
          params: {
            query: `phone_number:${formattedPhoneNumber}`,
            _fields: 'id'
          }
        });
        
        if (leadResponse.data.data.length > 0) {
          leadId = leadResponse.data.data[0].id;
        }
      } catch (error) {
        console.error('Error searching for lead:', error);
      }
    }
    
    // If we still don't have a lead ID, create a new lead
    if (!leadId) {
      const newLeadResponse = await client.post('/lead', {
        name: `Lead from ${phoneNumber}`,
        contacts: [
          {
            name: contactInfo?.name || 'Unknown',
            phones: [
              {
                phone: phoneNumber,
                type: 'office'
              }
            ]
          }
        ]
      });
      
      leadId = newLeadResponse.data.id;
    }
    
    // Create the activity
    const callActivity = await client.post('/activity/call', {
      lead_id: leadId,
      direction: 'outbound',
      status: 'completed',
      disposition: outcome, // e.g., "Answered - Interested"
      note: notes || '',
      phone: phoneNumber
    });
    
    return NextResponse.json({
      success: true,
      message: 'Call logged successfully',
      activityId: callActivity.data.id,
      leadId
    });
    
  } catch (error) {
    const { message, status } = handleCloseApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
} 