require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Test Close CRM connection
async function testCloseCRM() {
  try {
    const apiKey = process.env.CLOSE_CRM_API_KEY;

    if (!apiKey) {
      console.error('Error: CLOSE_CRM_API_KEY not found in environment variables');
      process.exit(1);
    }

    console.log('Using API key:', apiKey.substring(0, 10) + '...');

    const client = axios.create({
      baseURL: 'https://api.close.com/api/v1',
      auth: {
        username: apiKey,
        password: '', // Close API uses empty password with API key as username
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Test by getting user info (me endpoint)
    const response = await client.get('/me');
    
    console.log('Connection successful!');
    console.log('User info:', {
      id: response.data.id,
      name: response.data.first_name + ' ' + response.data.last_name,
      email: response.data.email,
    });

    // Get pipelines for reference
    const pipelinesResponse = await client.get('/pipeline');
    console.log('\nAvailable pipelines:');
    pipelinesResponse.data.data.forEach(pipeline => {
      console.log(`- ${pipeline.name} (${pipeline.id})`);
      console.log('  Statuses:');
      pipeline.statuses.forEach(status => {
        console.log(`  - ${status.label} (${status.id})`);
      });
    });

  } catch (error) {
    console.error('Error connecting to Close CRM:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testCloseCRM(); 