require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test the contact search feature
async function testContactSearch() {
  try {
    const baseURL = 'http://localhost:3000/api/closecrm';
    const phoneNumber = '14176297373';
    
    console.log(`Testing contact search for number: ${phoneNumber}`);
    
    // Call the search endpoint
    const searchResponse = await axios.get(`${baseURL}/search-contact?phoneNumber=${phoneNumber}`);
    
    console.log('Search response:', JSON.stringify(searchResponse.data, null, 2));
    
    if (searchResponse.data.contact) {
      console.log('\n✅ Contact found successfully!');
      console.log(`Contact: ${searchResponse.data.contact.name}`);
      console.log(`Lead: ${searchResponse.data.lead.name} (${searchResponse.data.lead.id})`);
      
      if (searchResponse.data.contact.phones) {
        console.log('\nPhone numbers:');
        searchResponse.data.contact.phones.forEach(phone => {
          console.log(`- ${phone.phone} (${phone.type})`);
        });
      }
    } else if (searchResponse.data.lead) {
      console.log('\n⚠️ Lead found but no specific contact matched:');
      console.log(`Lead: ${searchResponse.data.lead.name} (${searchResponse.data.lead.id})`);
    } else {
      console.log('\n❌ No contact or lead found with that phone number.');
    }
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testContactSearch(); 