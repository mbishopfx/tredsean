require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test integrating SMS with Close CRM pipeline
async function testSmsToCloseCrm() {
  try {
    const baseURL = 'http://localhost:3000/api/closecrm';
    const phoneNumber = '14176297373';
    const taskText = 'Create Audit and schedule meeting';
    
    console.log(`Testing SMS pipeline integration for number: ${phoneNumber}`);
    
    // Step 1: Search for contact by phone number
    console.log('\n1. Searching for contact...');
    const searchResponse = await axios.get(`${baseURL}/search-contact?phoneNumber=${phoneNumber}`);
    
    console.log('Search response:', JSON.stringify(searchResponse.data, null, 2));
    
    let leadId = null;
    
    // Check if we have either a contact or a lead
    if (searchResponse.data.contact) {
      console.log(`Found contact: ${searchResponse.data.contact.name}`);
      leadId = searchResponse.data.contact.leadId;
    } else if (searchResponse.data.lead) {
      console.log(`Found lead: ${searchResponse.data.lead.name} (${searchResponse.data.lead.id})`);
      leadId = searchResponse.data.lead.id;
    } else {
      console.log('No existing contact or lead found.');
      return;
    }
    
    // Step 2: Log a call
    console.log('\n2. Logging call activity...');
    const callResponse = await axios.post(`${baseURL}/log-call`, {
      phoneNumber,
      outcome: 'Answered - Interested',
      notes: 'Customer is interested in services. Following up with meeting.',
      contactInfo: { leadId }
    });
    
    console.log('Call logging response:', JSON.stringify(callResponse.data, null, 2));
    
    // Step 3: Create a task
    console.log('\n3. Creating task...');
    const taskResponse = await axios.post(`${baseURL}/create-task`, {
      leadId: leadId,
      text: taskText,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    });
    
    console.log('Task creation response:', JSON.stringify(taskResponse.data, null, 2));
    
    // Step 4: Get available pipelines and statuses
    console.log('\n4. Getting available pipelines...');
    const pipelinesResponse = await axios.get(`${baseURL}/list-pipelines`);
    
    if (pipelinesResponse.data.pipelines && pipelinesResponse.data.pipelines.length > 0) {
      const pipeline = pipelinesResponse.data.pipelines[0];
      
      // Find a good status - let's look for "Triage Set" or similar
      let statusId = null;
      const triageStatus = pipeline.statuses.find(s => s.label === 'Triage Set');
      if (triageStatus) {
        statusId = triageStatus.id;
      } else {
        // Default to first status
        statusId = pipeline.statuses[0].id;
      }
      
      const statusLabel = pipeline.statuses.find(s => s.id === statusId)?.label || 'Unknown';
      
      console.log(`Using pipeline: ${pipeline.name}`);
      console.log(`Using status: ${statusLabel}`);
      
      // Step 5: Update pipeline status
      console.log('\n5. Updating pipeline status...');
      const updateResponse = await axios.post(`${baseURL}/update-pipeline`, {
        leadId: leadId,
        pipelineId: pipeline.id,
        statusId: statusId
      });
      
      console.log('Pipeline update response:', JSON.stringify(updateResponse.data, null, 2));
    }
    
    console.log('\nTest completed!');
    
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

testSmsToCloseCrm(); 