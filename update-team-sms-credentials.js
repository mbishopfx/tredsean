// Quick script to update team member SMS Dove credentials
// Usage: node update-team-sms-credentials.js

const fs = require('fs');
const path = require('path');

// Team member credentials to update
// Fill these out as you get info from your team
const teamCredentials = {
  'Jontrd': {
    token: '', // Jon's SMS Dove token
    accountId: '' // Jon's account ID
  },
  'Jessetrd': {
    token: '', // Jesse's SMS Dove token  
    accountId: '' // Jesse's account ID
  },
  'Dantrd': {
    token: '', // Danny's SMS Dove token
    accountId: '' // Danny's account ID
  },
  'Josetrd': {
    token: '', // Jose's SMS Dove token
    accountId: '' // Jose's account ID
  }
};

function updateCredentials() {
  const authFilePath = path.join(__dirname, 'src/app/api/auth/route.ts');
  
  try {
    let authContent = fs.readFileSync(authFilePath, 'utf8');
    
    // Update each team member's credentials
    Object.keys(teamCredentials).forEach(username => {
      const creds = teamCredentials[username];
      
      if (creds.token && creds.accountId) {
        // Update token
        const tokenPattern = new RegExp(`(${username}[\\s\\S]*?token: ')([^']*)(')`, 'g');
        authContent = authContent.replace(tokenPattern, `$1${creds.token}$3`);
        
        // Update accountId  
        const accountPattern = new RegExp(`(${username}[\\s\\S]*?accountId: ')([^']*)(')`, 'g');
        authContent = authContent.replace(accountPattern, `$1${creds.accountId}$3`);
        
        console.log(`✅ Updated credentials for ${username}`);
      } else {
        console.log(`⏳ Waiting for credentials for ${username}`);
      }
    });
    
    fs.writeFileSync(authFilePath, authContent);
    console.log('🎉 Credentials update complete!');
    
  } catch (error) {
    console.error('❌ Error updating credentials:', error.message);
  }
}

// Example of how to use this script:
console.log('📋 SMS Dove Credential Updater');
console.log('================================');
console.log('');
console.log('📝 To update credentials:');
console.log('1. Edit this file (update-team-sms-credentials.js)');
console.log('2. Fill in the token and accountId for each team member');
console.log('3. Run: node update-team-sms-credentials.js');
console.log('');
console.log('🔍 Current status:');

// Show current status
Object.keys(teamCredentials).forEach(username => {
  const creds = teamCredentials[username];
  const hasToken = creds.token && creds.token.length > 0;
  const hasAccountId = creds.accountId && creds.accountId.length > 0;
  
  if (hasToken && hasAccountId) {
    console.log(`✅ ${username}: Ready to update`);
  } else {
    console.log(`⏳ ${username}: Waiting for credentials`);
  }
});

console.log('');
console.log('📱 Team members should send you:');
console.log('   - Account ID (number like "2317")');
console.log('   - Authorization Token (long string)');

// Uncomment the line below when you have credentials to update
// updateCredentials(); 