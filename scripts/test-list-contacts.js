require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test listing contacts from Close CRM
async function testListContacts() {
  try {
    const baseURL = 'http://localhost:3002/api/closecrm';
    
    console.log('Testing Close CRM Contacts API');
    
    // Step 1: Fetch contacts without any query
    console.log('\n1. Fetching contacts without query...');
    const response = await axios.get(`${baseURL}/list-contacts`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch contacts');
    }
    
    console.log(`Successfully fetched ${response.data.contacts.length} contacts`);
    
    // Show pagination info
    console.log('Pagination info:', response.data.pagination);
    
    // Step 2: Display some example contacts
    if (response.data.contacts.length > 0) {
      console.log('\n2. Example contacts:');
      
      const exampleContacts = response.data.contacts.slice(0, 3);
      exampleContacts.forEach((contact, index) => {
        console.log(`\nContact ${index + 1}:`);
        console.log(`  Name: ${contact.name}`);
        console.log(`  Lead: ${contact.leadName}`);
        console.log('  Phone numbers:');
        
        contact.phones.forEach(phone => {
          console.log(`    - ${phone.formattedNumber} (${phone.type})`);
        });
      });
      
      // Step 3: Test with search query if there are enough contacts
      if (response.data.contacts.length > 0) {
        const searchTerm = response.data.contacts[0].name.split(' ')[0]; // Use first name of first contact
        
        console.log(`\n3. Searching for contacts with query "${searchTerm}"...`);
        const searchResponse = await axios.get(`${baseURL}/list-contacts?query=${encodeURIComponent(searchTerm)}`);
        
        if (searchResponse.data.success) {
          console.log(`Found ${searchResponse.data.contacts.length} contacts matching "${searchTerm}"`);
          
          if (searchResponse.data.contacts.length > 0) {
            console.log('\nFirst matching contact:');
            const firstMatch = searchResponse.data.contacts[0];
            console.log(`  Name: ${firstMatch.name}`);
            console.log(`  Lead: ${firstMatch.leadName}`);
          }
        } else {
          console.log('Search failed:', searchResponse.data.error);
        }
      }
    } else {
      console.log('\nNo contacts found. Make sure there are contacts in your Close CRM account.');
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

// Run the test
testListContacts(); 