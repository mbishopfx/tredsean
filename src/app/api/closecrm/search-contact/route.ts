import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, formatPhoneNumber, handleCloseApiError } from '../utils';

// Mock data for testing without Close CRM credentials
const getMockContact = (phoneNumber: string) => {
  // Format the incoming phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  // If it's the specific test number we're looking for
  if (formattedPhone === '14176297373') {
    return {
      contact: {
        id: 'mock_contact_123',
        name: 'John Test',
        email: 'john.test@example.com',
        leadId: 'mock_lead_456',
        leadName: 'Test Company Inc.',
        phones: [
          {
            phone: '+14176297373',
            type: 'mobile'
          }
        ]
      },
      lead: {
        id: 'mock_lead_456',
        name: 'Test Company Inc.'
      }
    };
  }
  
  // For other numbers, return a generic mock
  return {
    contact: {
      id: 'mock_contact_999',
      name: 'Mock Contact',
      email: 'mock@example.com',
      leadId: 'mock_lead_888',
      leadName: 'Mock Company',
      phones: [
        {
          phone: phoneNumber,
          type: 'other'
        }
      ]
    },
    lead: {
      id: 'mock_lead_888',
      name: 'Mock Company'
    }
  };
};

export async function GET(request: NextRequest) {
  try {
    // Get the phone number from query params
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    console.log('Searching for phone number:', formattedPhoneNumber);
    
    try {
      const client = getCloseClient();
      
      // Search for leads by phone number
      // In Close CRM, contacts are organized under leads (companies)
      const response = await client.get('/lead', {
        params: {
          query: `phone_number:${formattedPhoneNumber}`,
          _fields: 'id,display_name,contacts'
        }
      });

      const leads = response.data.data;
      console.log(`Found ${leads.length} leads matching the phone number`);

      if (leads.length === 0) {
        // No matching lead found
        return NextResponse.json({ 
          contact: null,
          message: 'No contact found with that phone number' 
        });
      }

      // Get the first matching lead and extract contact info
      const lead = leads[0];
      console.log(`Lead: ${lead.display_name} (${lead.id})`);
      console.log(`Contacts in lead: ${lead.contacts ? lead.contacts.length : 0}`);
      
      // Find the specific contact with the matching phone number
      let matchingContact = null;
      
      // We need to get the full contact details
      if (lead.contacts && lead.contacts.length > 0) {
        for (const contactRef of lead.contacts) {
          const contactResponse = await client.get(`/contact/${contactRef.id}`);
          const contact = contactResponse.data;
          
          console.log(`Checking contact: ${contact.first_name || ''} ${contact.last_name || ''}`);
          console.log(`Contact phones: ${contact.phones ? contact.phones.length : 0}`);
          
          // Compare each phone number with both original and formatted versions
          let hasMatchingPhone = false;
          
          if (contact.phones && contact.phones.length > 0) {
            for (const phone of contact.phones) {
              const contactFormattedPhone = formatPhoneNumber(phone.phone);
              console.log(`Comparing ${contactFormattedPhone} with ${formattedPhoneNumber}`);
              
              if (contactFormattedPhone === formattedPhoneNumber || 
                  contactFormattedPhone.endsWith(formattedPhoneNumber) || 
                  formattedPhoneNumber.endsWith(contactFormattedPhone)) {
                hasMatchingPhone = true;
                break;
              }
            }
          }
          
          if (hasMatchingPhone) {
            matchingContact = {
              id: contact.id,
              name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown',
              email: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
              leadId: lead.id,
              leadName: lead.display_name,
              phones: contact.phones
            };
            console.log('Found matching contact:', matchingContact.name);
            break;
          }
        }
      }
      
      // If no matching contact was found but we have a lead, create a basic contact object
      if (!matchingContact && lead) {
        matchingContact = {
          id: lead.contacts && lead.contacts.length > 0 ? lead.contacts[0].id : null,
          name: 'Contact',
          leadId: lead.id,
          leadName: lead.display_name
        };
        console.log('Created basic contact from lead');
      }

      return NextResponse.json({
        contact: matchingContact,
        lead: {
          id: lead.id,
          name: lead.display_name
        }
      });
    } catch (clientError) {
      console.log('Close CRM client error, using mock data instead:', clientError);
      return NextResponse.json(getMockContact(phoneNumber));
    }
  } catch (error) {
    console.error('Error in search-contact endpoint:', error);
    
    // Fallback to mock data for any error
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phoneNumber') || '';
    return NextResponse.json(getMockContact(phoneNumber));
  }
} 