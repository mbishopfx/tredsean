require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test the pipeline update feature
async function testPipelineUpdate() {
  try {
    const baseURL = 'http://localhost:3000/api/closecrm';
    const leadId = 'lead_unQzD7r5xAzs9ennwlGBmowWFcbNFpnA5Zeni2yDMPS'; // BishopTech.dev
    
    console.log('Testing pipeline update endpoint...');
    
    // Step 1: Get available pipelines
    console.log('\n1. Getting available pipelines...');
    const pipelinesResponse = await axios.get(`${baseURL}/list-pipelines`);
    
    if (!pipelinesResponse.data.pipelines || pipelinesResponse.data.pipelines.length === 0) {
      console.log('No pipelines found');
      return;
    }
    
    const pipeline = pipelinesResponse.data.pipelines[0];
    console.log(`Found pipeline: ${pipeline.name} (${pipeline.id})`);
    
    // Find the "Triage Set" status or use the first one
    let statusId = null;
    let statusLabel = '';
    
    const triageStatus = pipeline.statuses.find(s => s.label === 'Triage Set');
    if (triageStatus) {
      statusId = triageStatus.id;
      statusLabel = triageStatus.label;
    } else {
      statusId = pipeline.statuses[0].id;
      statusLabel = pipeline.statuses[0].label;
    }
    
    console.log(`Using status: ${statusLabel} (${statusId})`);
    
    // Step 2: Update the pipeline status
    console.log('\n2. Updating pipeline status...');
    const updateResponse = await axios.post(`${baseURL}/update-pipeline`, {
      leadId: leadId,
      pipelineId: pipeline.id,
      statusId: statusId
    });
    
    console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));
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

testPipelineUpdate(); 