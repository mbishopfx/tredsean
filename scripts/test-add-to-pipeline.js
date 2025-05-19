require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test adding a contact to the pipeline
async function testAddToPipeline() {
  try {
    const baseURL = 'http://localhost:3000/api/closecrm';
    const phoneNumber = '14176297373';
    const taskText = 'Create Audit and schedule meeting';
    
    console.log(`Testing Add to Pipeline feature for number: ${phoneNumber}`);
    
    // Step 1: First search for the contact to get the leadId
    console.log('\n1. Searching for contact...');
    const searchResponse = await axios.get(`${baseURL}/search-contact?phoneNumber=${phoneNumber}`);
    
    console.log('Search response:', JSON.stringify(searchResponse.data, null, 2));
    
    let leadId = null;
    
    if (searchResponse.data.contact) {
      console.log(`Found contact: ${searchResponse.data.contact.name}`);
      leadId = searchResponse.data.contact.leadId;
    } else if (searchResponse.data.lead) {
      console.log(`Found lead: ${searchResponse.data.lead.name} (${searchResponse.data.lead.id})`);
      leadId = searchResponse.data.lead.id;
    } else {
      console.log('No contact or lead found. Cannot proceed with test.');
      return;
    }
    
    // Step 2: Add the contact to pipeline
    console.log(`\n2. Adding contact with leadId ${leadId} to pipeline...`);
    const addResponse = await axios.post(`${baseURL}/add-to-pipeline`, {
      phoneNumber,
      leadId,
      taskText
    });
    
    console.log('Add to Pipeline response:', JSON.stringify(addResponse.data, null, 2));
    
    // Step 3: Show a success message with summary
    if (addResponse.data.success) {
      console.log('\n✅ Contact successfully added to pipeline!');
      
      // Summarize actions performed
      if (addResponse.data.results.actions) {
        console.log('\nActions performed:');
        addResponse.data.results.actions.forEach(action => {
          if (action.action === 'add_tags') {
            console.log(`- Added tags: ${action.tags.join(', ')}`);
          } else if (action.action === 'create_task') {
            console.log(`- Created task: "${action.taskText}" due on ${action.dueDate}`);
          }
        });
      }
      
      // Show lead info
      if (addResponse.data.results.lead) {
        const lead = addResponse.data.results.lead;
        console.log(`\nLead information updated: ${lead.name} (${lead.id})`);
        console.log(`Current tags: ${lead.tags.join(', ')}`);
      }
    } else {
      console.log('\n❌ Failed to add contact to pipeline.');
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

testAddToPipeline(); 