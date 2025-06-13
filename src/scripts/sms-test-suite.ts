import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface User {
  username: string;
  password: string;
  displayName: string;
}

interface AuthResponse {
  success: boolean;
  userInfo?: {
    smsGateway: any;
  };
}

interface SMSResponse {
  success: boolean;
  error?: string;
}

const TEST_USERS: User[] = [
  { username: 'Seantrd', password: 'Croatia123!', displayName: 'Sean' },
  { username: 'Jontrd', password: 'TeamElite123!', displayName: 'Jon' },
  { username: 'Juantrd', password: 'TeamElite124!', displayName: 'Juan' },
  { username: 'Josetrd', password: 'TeamElite123!', displayName: 'Jose' },
];

const TEST_NUMBERS = {
  single: '4176297373',
  group: ['15176297373', '16467705587']
};

const TEST_MESSAGES = {
  single: (user: string) => `[TEST SMS] This is an automated single message test from ${user}'s account. Please ignore.`,
  group: (user: string) => `[TEST SMS] This is an automated group message test from ${user}'s account. Please ignore.`
};

// Create test CSV content
const createTestCSV = (numbers: string[]) => {
  const header = 'First Name,Last Name,Phone Number,Custom1,Custom2\n';
  const rows = numbers.map((number, i) => 
    `Test${i + 1},User${i + 1},${number},Field1-${i + 1},Field2-${i + 1}`
  ).join('\n');
  return header + rows;
};

async function login(username: string, password: string): Promise<string | null> {
  try {
    const response = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        type: 'team'
      })
    });

    const data = await response.json() as AuthResponse;
    if (data.success) {
      return data.userInfo?.smsGateway;
    }
  } catch (error) {
    console.error(`Login failed for ${username}:`, error);
  }
  return null;
}

async function sendSingleMessage(
  smsGateway: any,
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        message,
        smsGateway
      })
    });

    const data = await response.json() as SMSResponse;
    return data.success;
  } catch (error) {
    console.error('Single message send failed:', error);
    return false;
  }
}

async function sendGroupMessage(
  smsGateway: any,
  csvContent: string,
  message: string
): Promise<boolean> {
  try {
    // Save temporary CSV file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const csvPath = path.join(tempDir, 'test-contacts.csv');
    fs.writeFileSync(csvPath, csvContent);

    // Create form data
    const formData = new FormData();
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'test-contacts.csv');
    formData.append('message', message);
    formData.append('smsGateway', JSON.stringify(smsGateway));

    const response = await fetch('http://localhost:3000/api/send-bulk-sms', {
      method: 'POST',
      body: formData
    });

    const data = await response.json() as SMSResponse;
    
    // Cleanup
    fs.unlinkSync(csvPath);
    
    return data.success;
  } catch (error) {
    console.error('Group message send failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting SMS Gateway Test Suite');
  console.log('===============================\n');

  const csvContent = createTestCSV(TEST_NUMBERS.group);
  const results: any = {};

  for (const user of TEST_USERS) {
    console.log(`Testing ${user.displayName}'s account (${user.username})`);
    console.log('----------------------------------------');

    const smsGateway = await login(user.username, user.password);
    if (!smsGateway) {
      console.log('❌ Login failed\n');
      results[user.username] = { login: false };
      continue;
    }
    console.log('✅ Login successful');

    // Test single message
    console.log('\nTesting single message...');
    const singleResult = await sendSingleMessage(
      smsGateway,
      TEST_NUMBERS.single,
      TEST_MESSAGES.single(user.displayName)
    );
    console.log(singleResult ? '✅ Single message sent' : '❌ Single message failed');

    // Test group message
    console.log('\nTesting group message...');
    const groupResult = await sendGroupMessage(
      smsGateway,
      csvContent,
      TEST_MESSAGES.group(user.displayName)
    );
    console.log(groupResult ? '✅ Group message sent' : '❌ Group message failed');

    results[user.username] = {
      login: true,
      singleMessage: singleResult,
      groupMessage: groupResult
    };

    console.log('\nWaiting 30 seconds before testing next account...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  // Print summary
  console.log('\nTest Results Summary');
  console.log('===================');
  Object.entries(results).forEach(([username, result]: [string, any]) => {
    console.log(`\n${username}:`);
    console.log(`  Login: ${result.login ? '✅' : '❌'}`);
    if (result.login) {
      console.log(`  Single Message: ${result.singleMessage ? '✅' : '❌'}`);
      console.log(`  Group Message: ${result.groupMessage ? '✅' : '❌'}`);
    }
  });
}

// Run the test suite
runTests().catch(console.error); 