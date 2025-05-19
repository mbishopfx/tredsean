const axios = require('axios');

// Test Close CRM connection with direct API key
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

    // Test by getting user info (me endpoint)
    const response = await client.get('/me');
    
    console.log('Connection successful!');
    console.log('User info:', {
      id: response.data.id,
      name: response.data.first_name + ' ' + response.data.last_name,
      email: response.data.email,
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