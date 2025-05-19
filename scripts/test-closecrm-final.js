require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test Close CRM integration
async function testCloseCRM() {
  try {
    const apiKey = process.env.CLOSE_CRM_API_KEY;
    
    if (!apiKey) {
      console.error('Error: CLOSE_CRM_API_KEY not found in environment variables');
      process.exit(1);
    }
    
    console.log('Using API key:', apiKey.substring(0, 10) + '...');
    
    // Create client with authorization header
    const client = axios.create({
      baseURL: 'https://api.close.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
      }
    });
    
    // Test pipeline data (which you'll need for lead management)
    console.log('\nFetching pipelines...');
    const pipelinesResponse = await client.get('/pipeline');
    console.log(`Found ${pipelinesResponse.data.data.length} pipelines`);
    
    if (pipelinesResponse.data.data.length > 0) {
      const pipeline = pipelinesResponse.data.data[0];
      console.log(`\nFirst pipeline: ${pipeline.name} (${pipeline.id})`);
      console.log('Available statuses:');
      pipeline.statuses.forEach(status => {
        console.log(`- ${status.label} (${status.id})`);
      });
      
      // Save these IDs for your application
      console.log('\nAdd these values to your configuration:');
      console.log(`Default Pipeline ID: ${pipeline.id}`);
      const newStatus = pipeline.statuses.find(s => s.type === 'incoming');
      if (newStatus) {
        console.log(`Default New Lead Status ID: ${newStatus.id}`);
      }
    }
    
    // Test: Get leads
    console.log('\nFetching recent leads...');
    const leadsResponse = await client.get('/lead', { params: { _limit: 5 } });
    console.log(`Found ${leadsResponse.data.data.length} leads`);
    
    if (leadsResponse.data.data.length > 0) {
      console.log('\nRecent leads:');
      leadsResponse.data.data.forEach(lead => {
        console.log(`- ${lead.display_name} (${lead.id})`);
      });
    }
    
    console.log('\n✅ Close CRM connection successful! Your API endpoints should work correctly.');
    
  } catch (error) {
    console.error('❌ Error connecting to Close CRM:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testCloseCRM(); 