require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test specific contact operations
async function testSpecificContact() {
  try {
    const apiKey = process.env.CLOSE_CRM_API_KEY;
    const phoneNumber = '14176297373';
    const taskText = 'Create Audit and schedule meeting';
    
    if (!apiKey) {
      console.error('Error: CLOSE_CRM_API_KEY not found in environment variables');
      process.exit(1);
    }
    
    // Create client with authorization header
    const client = axios.create({
      baseURL: 'https://api.close.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
      }
    });
    
    // Step 1: Search for contact by phone number
    console.log(`Searching for contact with phone number: ${phoneNumber}`);
    const formattedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    const response = await client.get('/lead', {
      params: {
        query: `phone_number:${formattedPhoneNumber}`,
        _fields: 'id,display_name,contacts'
      }
    });
    
    const leads = response.data.data;
    
    if (leads.length === 0) {
      console.log('No contact found with that phone number.');
      
      // Create a new lead with this phone number
      console.log('Creating a new lead with this phone number...');
      const newLeadData = {
        name: `Lead from ${phoneNumber}`,
        contacts: [
          {
            name: 'New Contact',
            phones: [
              {
                phone: phoneNumber,
                type: 'office'
              }
            ]
          }
        ]
      };
      
      const newLeadResponse = await client.post('/lead', newLeadData);
      console.log(`Created new lead: ${newLeadResponse.data.display_name} (${newLeadResponse.data.id})`);
      
      // Use the new lead
      var leadId = newLeadResponse.data.id;
      var leadName = newLeadResponse.data.display_name;
    } else {
      // Use the existing lead
      var lead = leads[0];
      var leadId = lead.id;
      var leadName = lead.display_name;
      console.log(`Found existing lead: ${leadName} (${leadId})`);
      
      // Get contact details
      if (lead.contacts && lead.contacts.length > 0) {
        const contactId = lead.contacts[0].id;
        const contactResponse = await client.get(`/contact/${contactId}`);
        console.log(`Contact: ${contactResponse.data.first_name || ''} ${contactResponse.data.last_name || ''}`);
        
        if (contactResponse.data.phones && contactResponse.data.phones.length > 0) {
          console.log('Phone numbers:');
          contactResponse.data.phones.forEach(phone => {
            console.log(`- ${phone.phone} (${phone.type})`);
          });
        }
      }
    }
    
    // Step 2: Create a task for the lead
    console.log(`\nCreating task "${taskText}" for lead ${leadName}`);
    
    const taskData = {
      lead_id: leadId,
      text: taskText,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    };
    
    const taskResponse = await client.post('/task', taskData);
    
    console.log(`✅ Task created successfully!`);
    console.log(`Task ID: ${taskResponse.data.id}`);
    console.log(`Task Text: ${taskResponse.data.text}`);
    console.log(`Due Date: ${taskResponse.data.due_date || 'Not set'}`);
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testSpecificContact(); 