require('dotenv').config({ path: '.env.local' });
const { getCloseClient } = require('../src/app/api/closecrm/utils');

// Test all Close CRM endpoints
async function testCloseEndpoints() {
  try {
    console.log('Creating Close CRM client...');
    const client = getCloseClient();
    
    // Test 1: Get user info
    console.log('\n1. Testing user info endpoint...');
    try {
      const meResponse = await client.get('/me');
      console.log('✅ User info endpoint success!');
      console.log('User:', {
        id: meResponse.data.id,
        name: `${meResponse.data.first_name} ${meResponse.data.last_name}`,
        email: meResponse.data.email
      });
    } catch (error) {
      console.error('❌ User info endpoint failed:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test 2: Get pipelines
    console.log('\n2. Testing pipelines endpoint...');
    try {
      const pipelinesResponse = await client.get('/pipeline');
      console.log('✅ Pipelines endpoint success!');
      console.log(`Found ${pipelinesResponse.data.data.length} pipelines`);
      if (pipelinesResponse.data.data.length > 0) {
        const pipeline = pipelinesResponse.data.data[0];
        console.log(`First pipeline: ${pipeline.name} (${pipeline.id})`);
        console.log(`Statuses: ${pipeline.statuses.length} statuses available`);
      }
    } catch (error) {
      console.error('❌ Pipelines endpoint failed:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test 3: Get leads
    console.log('\n3. Testing leads endpoint...');
    try {
      const leadsResponse = await client.get('/lead', { params: { _limit: 5 } });
      console.log('✅ Leads endpoint success!');
      console.log(`Found ${leadsResponse.data.data.length} leads`);
      if (leadsResponse.data.data.length > 0) {
        // Save first lead ID for later tests
        const firstLead = leadsResponse.data.data[0];
        console.log(`First lead: ${firstLead.display_name} (${firstLead.id})`);
        
        // Test 4: Get specific lead contacts
        if (firstLead.contacts && firstLead.contacts.length > 0) {
          console.log('\n4. Testing contacts endpoint...');
          try {
            const contactId = firstLead.contacts[0].id;
            const contactResponse = await client.get(`/contact/${contactId}`);
            console.log('✅ Contact endpoint success!');
            console.log(`Contact: ${contactResponse.data.first_name} ${contactResponse.data.last_name}`);
            
            // Get phone numbers if available
            if (contactResponse.data.phones && contactResponse.data.phones.length > 0) {
              console.log('Phone numbers:');
              contactResponse.data.phones.forEach(phone => {
                console.log(`- ${phone.phone} (${phone.type})`);
              });
            }
          } catch (error) {
            console.error('❌ Contact endpoint failed:', error.response?.status, error.response?.data || error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Leads endpoint failed:', error.response?.status, error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

testCloseEndpoints(); 