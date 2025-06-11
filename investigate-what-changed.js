const https = require('https');

console.log('🔍 INVESTIGATING WHAT CHANGED');
console.log('=============================');
console.log('Sean WAS working before, so what changed?');
console.log('');

const credentials = {
  jon: 'AD2XA0:2nitkjiqnmrrtc',     // Working (older account?)
  sean: '_WPYVV:xvqlgyspgvx5hy',    // WAS working, now false positive
  jose: '_NNSZW:9qajexoy9ihhnl'     // Never worked reliably
};

// Theory 1: Account age/creation date matters
console.log('💡 THEORY 1: Account Age/Status Differences');
console.log('===========================================');
console.log('Jon (AD2XA0): Older account, still works');
console.log('Sean (_WPYVV): Fresh credentials after reset, now broken'); 
console.log('Jose (_NNSZW): Unclear age, not working');
console.log('');

// Theory 2: Service gradually rolling out changes
console.log('💡 THEORY 2: Service-Side A/B Testing');
console.log('=====================================');
console.log('SMS Gateway service may be testing new behavior');
console.log('Some accounts get old working behavior (Jon)');
console.log('Some accounts get new broken behavior (Sean/Jose)');
console.log('');

function getAccountInfo(name, creds) {
  return new Promise((resolve, reject) => {
    // Try to get account/device info
    const req = https.request({
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/device',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(creds).toString('base64')}`
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`📱 ${name} device info:`);
          console.log(JSON.stringify(parsed, null, 2));
          console.log('');
          resolve(parsed);
        } catch (e) {
          console.log(`📱 ${name} device info (raw):`);
          console.log(responseData);
          console.log('');
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${name} device info failed:`, error.message);
      reject(error);
    });

    req.end();
  });
}

function testWithOldCredentials() {
  console.log('🧪 THEORY 3: Testing Sean\'s OLD credentials');
  console.log('=============================================');
  console.log('Before reset, Sean had: BGELNS:mxahcnqjgirfpd');
  console.log('Testing if old credentials still work...');
  console.log('');

  const oldSeanCreds = 'BGELNS:mxahcnqjgirfpd';
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: 'SEAN OLD CREDS TEST - ' + new Date().toLocaleTimeString(),
      phoneNumbers: ['+14176297373']
    });

    const options = {
      hostname: 'api.sms-gate.app',
      port: 443,
      path: '/3rdparty/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(oldSeanCreds).toString('base64')}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log('📡 Sean\'s OLD credentials result:');
        if (res.statusCode === 202) {
          const parsed = JSON.parse(responseData);
          console.log(JSON.stringify(parsed, null, 2));
          console.log('✅ OLD credentials still work!');
          
          setTimeout(() => {
            // Check status
            const statusReq = https.request({
              hostname: 'api.sms-gate.app',
              port: 443,
              path: `/3rdparty/v1/message/${parsed.id}`,
              method: 'GET',
              headers: {
                'Authorization': `Basic ${Buffer.from(oldSeanCreds).toString('base64')}`
              }
            }, (statusRes) => {
              let statusData = '';
              statusRes.on('data', (chunk) => { statusData += chunk; });
              statusRes.on('end', () => {
                const status = JSON.parse(statusData);
                console.log('📊 Sean OLD credentials final status:');
                console.log(JSON.stringify(status, null, 2));
                console.log('');
                console.log('🎯 CRITICAL QUESTION: Did you receive this message?');
                console.log('If YES: Old credentials work, new ones broken');
                console.log('If NO: All Sean credentials broken now');
                resolve(status);
              });
            });
            statusReq.end();
          }, 12000);
          
        } else {
          console.log(`❌ Status ${res.statusCode}: ${responseData}`);
          if (res.statusCode === 401) {
            console.log('💡 Old credentials expired/revoked');
          }
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Old credentials test failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runInvestigation() {
  try {
    console.log('🔍 Getting device info for all accounts...');
    console.log('');
    
    // Get device info
    await Promise.all([
      getAccountInfo('JON', credentials.jon),
      getAccountInfo('SEAN-NEW', credentials.sean),
      getAccountInfo('JOSE', credentials.jose)
    ]);
    
    console.log('🧪 Testing Sean\'s old credentials...');
    await testWithOldCredentials();
    
  } catch (error) {
    console.log('❌ Investigation failed:', error.message);
  }
}

console.log('🚀 Starting investigation...');
console.log('');
runInvestigation(); 