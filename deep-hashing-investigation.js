const https = require('https');
const crypto = require('crypto');

console.log('🔬 DEEP HASHING INVESTIGATION');
console.log('=============================');
console.log('Testing multiple theories for why Jon works but Sean/Jose don\'t');
console.log('');

const credentials = {
  jon: 'AD2XA0:2nitkjiqnmrrtc',
  sean: '_WPYVV:xvqlgyspgvx5hy',
  jose: '_NNSZW:9qajexoy9ihhnl'
};

const phoneNumber = '+14176297373';

// Function to hash phone number like Jon's format
function hashPhoneNumber(phone) {
  return crypto.createHash('md5').update(phone).digest('hex').substring(0, 16);
}

function makeRequest(creds, message, phoneNumbers, options = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      phoneNumbers: phoneNumbers,
      ...options
    });

    const requestOptions = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(creds).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(requestOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

async function runInvestigation() {
  console.log('🧪 TEST 1: Pre-hashed phone numbers');
  console.log('===================================');
  
  const hashedPhone = hashPhoneNumber(phoneNumber);
  console.log(`Original: ${phoneNumber}`);
  console.log(`Hashed:   ${hashedPhone}`);
  console.log('');
  
  try {
    console.log('Testing Sean with pre-hashed phone number...');
    const seanHashedResult = await makeRequest(
      credentials.sean, 
      'SEAN PRE-HASHED TEST - ' + new Date().toLocaleTimeString(),
      [hashedPhone]
    );
    console.log('Sean with hashed phone:');
    console.log(JSON.stringify(seanHashedResult.data, null, 2));
    console.log('');
  } catch (e) {
    console.log('❌ Sean hashed test failed:', e.message);
  }

  console.log('🧪 TEST 2: Force hashing parameter');
  console.log('==================================');
  
  try {
    console.log('Testing Sean with isHashed: true parameter...');
    const seanForceHashResult = await makeRequest(
      credentials.sean,
      'SEAN FORCE HASH TEST - ' + new Date().toLocaleTimeString(),
      [phoneNumber],
      { isHashed: true }
    );
    console.log('Sean with isHashed parameter:');
    console.log(JSON.stringify(seanForceHashResult.data, null, 2));
    console.log('');
  } catch (e) {
    console.log('❌ Sean force hash test failed:', e.message);
  }

  console.log('🧪 TEST 3: Mimic Jon\'s exact format');
  console.log('===================================');
  
  try {
    console.log('Testing Sean with Jon\'s exact successful format...');
    
    // First get Jon's current successful format
    const jonResult = await makeRequest(
      credentials.jon,
      'JON FORMAT REFERENCE - ' + new Date().toLocaleTimeString(),
      [phoneNumber]
    );
    
    console.log('Jon\'s current format:');
    console.log(JSON.stringify(jonResult.data, null, 2));
    console.log('');
    
    // Wait and check Jon's status
    setTimeout(async () => {
      try {
        const jonStatusReq = https.request({
          hostname: 'api.sms-gate.app',
          port: 443,
          path: `/3rdparty/v1/message/${jonResult.data.id}`,
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(credentials.jon).toString('base64')}`
          }
        }, (res) => {
          let statusData = '';
          res.on('data', (chunk) => { statusData += chunk; });
          res.on('end', () => {
            const jonStatus = JSON.parse(statusData);
            console.log('Jon\'s detailed status:');
            console.log(JSON.stringify(jonStatus, null, 2));
            console.log('');
            
            if (jonStatus.isHashed && jonStatus.recipients) {
              const hashedFormat = jonStatus.recipients[0].phoneNumber;
              console.log(`Jon's hashed format: ${hashedFormat}`);
              
              // Now test Sean with Jon's exact hashed format
              setTimeout(async () => {
                try {
                  console.log('Testing Sean with Jon\'s exact hashed phone number...');
                  const seanMimicResult = await makeRequest(
                    credentials.sean,
                    'SEAN MIMIC JON - ' + new Date().toLocaleTimeString(),
                    [hashedFormat]
                  );
                  console.log('Sean mimicking Jon\'s format:');
                  console.log(JSON.stringify(seanMimicResult.data, null, 2));
                } catch (e) {
                  console.log('❌ Sean mimic test failed:', e.message);
                }
              }, 2000);
            }
          });
        });
        jonStatusReq.end();
      } catch (e) {
        console.log('❌ Jon status check failed:', e.message);
      }
    }, 8000);
    
  } catch (e) {
    console.log('❌ Jon reference test failed:', e.message);
  }

  console.log('🧪 TEST 4: Different API parameters');
  console.log('===================================');
  
  const testParams = [
    { encrypt: true },
    { priority: 'high' },
    { deliveryReport: true },
    { simSlot: 1 },
    { simSlot: 0 }
  ];
  
  for (const params of testParams) {
    try {
      console.log(`Testing Sean with params: ${JSON.stringify(params)}`);
      const result = await makeRequest(
        credentials.sean,
        `SEAN PARAM TEST ${JSON.stringify(params)} - ` + new Date().toLocaleTimeString(),
        [phoneNumber],
        params
      );
      console.log(`Result with ${JSON.stringify(params)}:`);
      console.log(JSON.stringify(result.data, null, 2));
      console.log('');
      
      // Quick delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.log(`❌ Param test ${JSON.stringify(params)} failed:`, e.message);
    }
  }

  console.log('🧪 TEST 5: Alternative endpoints');
  console.log('================================');
  
  const endpoints = [
    '/3rdparty/v1/message',
    '/mobile/v1/message',
    '/api/v1/message'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing Sean on endpoint: ${endpoint}`);
      
      const data = JSON.stringify({
        message: `SEAN ENDPOINT TEST ${endpoint} - ` + new Date().toLocaleTimeString(),
        phoneNumbers: [phoneNumber]
      });

      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.sms-gate.app',
          port: 443,
          path: endpoint,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(credentials.sean).toString('base64')}`,
            'Content-Length': data.length
          }
        };

        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => { responseData += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(responseData);
              resolve({ statusCode: res.statusCode, data: parsed });
            } catch (e) {
              resolve({ statusCode: res.statusCode, data: responseData });
            }
          });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
      });

      console.log(`${endpoint} result:`);
      console.log(JSON.stringify(result, null, 2));
      console.log('');
      
    } catch (e) {
      console.log(`❌ Endpoint ${endpoint} failed:`, e.message);
    }
  }

  console.log('🔍 SUMMARY OF INVESTIGATION');
  console.log('===========================');
  console.log('Key findings will appear above.');
  console.log('Look for any test that shows "isHashed": true for Sean');
  console.log('or any successful workaround that makes messages deliver.');
}

runInvestigation(); 