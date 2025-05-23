import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, handleCloseApiError } from '../utils';

export async function GET(request: NextRequest) {
  try {
    const client = getCloseClient();
    
    // Get search parameters (optional)
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const requestedPage = parseInt(searchParams.get('page') || '1', 10);
    
    console.log(`Fetching contacts from Close CRM, page ${requestedPage}, query: "${query}"`);
    
    // First, get the total count
    const initialResponse = await client.get('/lead/', {
      params: {
        _limit: 1,
        _skip: 0,
        query: query
      }
    });
    
    const totalLeads = initialResponse.data.total_results || 0;
    console.log(`Total leads in Close CRM: ${totalLeads}`);
    
    // Now fetch ALL leads to get all contacts
    const allLeads = [];
    const batchSize = 100; // Close CRM max limit per request
    
    for (let skip = 0; skip < totalLeads; skip += batchSize) {
      const batchResponse = await client.get('/lead/', {
        params: {
          _limit: batchSize,
          _skip: skip,
          query: query
        }
      });
      
      if (batchResponse.data.data && Array.isArray(batchResponse.data.data)) {
        allLeads.push(...batchResponse.data.data);
      }
    }
    
    console.log(`Fetched ${allLeads.length} leads total`);
    
    // Extract contact information from ALL leads
    const contacts = [];
    
    for (const lead of allLeads) {
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
    
    console.log(`Extracted ${contacts.length} contacts with phone numbers`);
    
    return NextResponse.json({
      success: true,
      contacts,
      pagination: {
        page: requestedPage,
        limit: contacts.length,
        total: contacts.length
      }
    });
  } catch (error) {
    const { message, status } = handleCloseApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
} 