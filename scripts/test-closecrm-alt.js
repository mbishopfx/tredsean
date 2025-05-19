const axios = require('axios');

// Test Close CRM connection with alternative endpoints
async function testCloseCRM() {
  try {
    // Use API key directly for testing
    const apiKey = 'api_4IUKt8i6pWi1XLIIVWU0Oh.5iZ7YmG2zfDUJohhsa2yLJ';

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

    // Try different endpoints to test authentication
    
    console.log('Testing organization endpoint...');
    try {
      const orgResponse = await client.get('/organization');
      console.log('Organization endpoint success!');
      console.log('Organization info:', orgResponse.data);
    } catch (error) {
      console.error('Organization endpoint failed:', error.response?.status, error.response?.data || error.message);
    }
    
    console.log('\nTesting user endpoint...');
    try {
      const userResponse = await client.get('/user');
      console.log('User endpoint success!');
      console.log('Number of users:', userResponse.data.data.length);
    } catch (error) {
      console.error('User endpoint failed:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\nTesting lead endpoint...');
    try {
      const leadResponse = await client.get('/lead', { params: { _limit: 1 } });
      console.log('Lead endpoint success!');
      console.log('Number of leads:', leadResponse.data.data.length);
    } catch (error) {
      console.error('Lead endpoint failed:', error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('General error connecting to Close CRM:');
    console.error(error.message);
  }
}

testCloseCRM(); 