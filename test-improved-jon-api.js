// Test script for improved Jon's SMS Gateway API
const https = require('https');

async function testImprovedJonAPI() {
  console.log('🧪 Testing Improved Jon\'s SMS Gateway API\n');
  
  // Test with local dev server first
  const testCases = [
    {
      name: 'Valid message',
      phoneNumber: '+14176297373',
      message: 'Test from improved API - ' + new Date().toLocaleTimeString()
    },
    {
      name: 'Empty message (should fail)',
      phoneNumber: '+14176297373',
      message: ''
    },
    {
      name: 'Missing phone (should fail)',
      phoneNumber: '',
      message: 'Test message'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch('http://localhost:3002/api/sms-gateway/send-jon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testCase.phoneNumber,
          message: testCase.message
        }),
      });
      
      const data = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Response:`, data);
      
      if (response.ok) {
        console.log('✅ Test passed');
      } else {
        console.log('❌ Test failed (expected for validation errors)');
      }
      
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
    
    console.log('---\n');
  }
}

// Test rate limiting
async function testRateLimit() {
  console.log('🚦 Testing Rate Limiting\n');
  
  const promises = [];
  
  // Send 35 requests quickly (should hit the 30/minute limit)
  for (let i = 0; i < 35; i++) {
    promises.push(
      fetch('http://localhost:3002/api/sms-gateway/send-jon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: '+14176297373',
          message: `Rate limit test ${i + 1}`
        }),
      }).then(res => ({ index: i + 1, status: res.status }))
    );
  }
  
  try {
    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.status === 200).length;
    const rateLimited = results.filter(r => r.status === 429).length;
    
    console.log(`📊 Rate Limit Test Results:`);
    console.log(`✅ Successful requests: ${successful}`);
    console.log(`🚫 Rate limited requests: ${rateLimited}`);
    
    if (rateLimited > 0) {
      console.log('✅ Rate limiting is working correctly!');
    } else {
      console.log('⚠️ Rate limiting may not be working as expected');
    }
    
  } catch (error) {
    console.log('❌ Rate limit test failed:', error.message);
  }
}

async function runTests() {
  await testImprovedJonAPI();
  await testRateLimit();
}

runTests(); 