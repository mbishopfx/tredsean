require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test adding a contact to the pipeline with tags
async function testAddToPipelineWithTags() {
  try {
    const baseURL = 'http://localhost:3000/api/closecrm';
    const phoneNumber = '14176297373';
    const taskText = 'Create Audit and schedule meeting';
    
    console.log(`Testing Add to Pipeline feature with tag verification for number: ${phoneNumber}`);
    
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
    
    // Step 2: Add the contact to pipeline using the revised endpoint
    console.log(`\n2. Adding contact with leadId ${leadId} to pipeline with tags...`);
    
    const addResponse = await axios.post(`${baseURL}/add-to-pipeline`, {
      phoneNumber,
      leadId,
      taskText
    });
    
    console.log('Add to Pipeline response:', JSON.stringify(addResponse.data, null, 2));
    
    // Step 3: Check if tags were successfully added
    if (addResponse.data.success) {
      console.log('\n✅ Contact successfully added to pipeline!');
      
      // Check tag status
      const tagAction = addResponse.data.results.actions.find(action => action.action === 'add_tags');
      
      if (tagAction) {
        if (tagAction.success) {
          console.log('\n✅ Tags successfully added:');
          console.log(tagAction.actual_tags.join(', '));
        } else {
          console.log('\n❌ Failed to add some or all tags.');
          console.log('- Requested tags:', tagAction.requested_tags.join(', '));
          console.log('- Actual tags:', tagAction.actual_tags.join(', '));
        }
      }
      
      // Show task information
      const taskAction = addResponse.data.results.actions.find(action => action.action === 'create_task');
      if (taskAction) {
        console.log(`\n✅ Task created: "${taskAction.taskText}" due on ${taskAction.dueDate}`);
      }
      
      // Show lead info
      if (addResponse.data.results.lead) {
        const lead = addResponse.data.results.lead;
        console.log(`\nLead information: ${lead.name} (${lead.id})`);
        console.log(`Current tags: ${lead.tags.length > 0 ? lead.tags.join(', ') : 'None'}`);
      }
    } else {
      console.log('\n❌ Failed to add contact to pipeline.');
    }
    
    // Step 4: Directly verify with the API
    console.log('\n4. Directly verifying tags with Close API...');
    
    const client = axios.create({
      baseURL: 'https://api.close.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.CLOSE_CRM_API_KEY + ':').toString('base64')}`
      }
    });
    
    const verifyResponse = await client.get(`/lead/${leadId}/`);
    
    console.log(`\nDirect API verification for lead ${leadId}:`);
    console.log('Tags from API:', verifyResponse.data.tags || 'None');
    
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
testAddToPipelineWithTags(); 