const axios = require('axios');

// Test Close CRM connection using header authentication
async function testCloseCRM() {
  try {
    // Use API key directly for testing
    const apiKey = 'api_4IUKt8i6pWi1XLIIVWU0Oh.5iZ7YmG2zfDUJohhsa2yLJ';

    console.log('Using API key:', apiKey.substring(0, 10) + '...');

    const client = axios.create({
      baseURL: 'https://api.close.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
      },
    });

    console.log('Testing lead endpoint...');
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