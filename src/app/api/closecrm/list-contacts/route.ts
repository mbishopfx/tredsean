import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, handleCloseApiError } from '../utils';

export async function GET(request: NextRequest) {
  try {
    const client = getCloseClient();
    const limit = 100; // Max number of contacts to fetch

    // Get search parameters (optional)
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;
    
    console.log(`Fetching contacts from Close CRM, page ${page}, query: "${query}"`);
    
    // First, fetch leads to get the leads with contacts
    const leadsResponse = await client.get('/lead/', {
      params: {
        _limit: limit,
        _skip: skip,
        query: query
      }
    });
    
    if (!leadsResponse.data.data || !Array.isArray(leadsResponse.data.data)) {
      throw new Error('Invalid response format from Close CRM API');
    }
    
    const leads = leadsResponse.data.data;
    
    // Extract contact information from leads
    const contacts = [];
    
    for (const lead of leads) {
      if (lead.contacts && Array.isArray(lead.contacts)) {
        for (const contact of lead.contacts) {
          if (contact.phones && Array.isArray(contact.phones) && contact.phones.length > 0) {
            // For each contact with phone numbers, add an entry
            contacts.push({
              id: contact.id,
              name: contact.name || contact.display_name || 'Unknown',
              leadId: lead.id,
              leadName: lead.name || lead.display_name,
              phones: contact.phones.map((phone: any) => ({
                number: phone.phone,
                formattedNumber: phone.phone_formatted,
                type: phone.type
              })),
              emails: contact.emails || []
            });
          }
        }
      }
    }
    
    // Sort contacts by name
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json({
      success: true,
      contacts,
      pagination: {
        page,
        limit,
        total: leadsResponse.data.total_results || 0
      }
    });
  } catch (error) {
    const { message, status } = handleCloseApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
} 