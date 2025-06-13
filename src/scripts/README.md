# SMS Gateway Test Suite

This test suite systematically tests SMS messaging capabilities for each user account in the system.

## What it Tests

1. **Login Verification**
   - Attempts to log in with each user's credentials
   - Verifies SMS Gateway configuration is accessible

2. **Single Message Testing**
   - Sends a single test message to: 4176297373
   - Includes user-specific identifier in message

3. **Group Message Testing**
   - Sends group messages to:
     - 15176297373
     - 16467705587
   - Uses test CSV with mock data
   - Includes user-specific identifier in message

## Test Process

1. Tests each user account sequentially:
   - Sean
   - Jon
   - Juan
   - Jose

2. For each user:
   - Logs in
   - Tests single message
   - Tests group message
   - Waits 30 seconds before testing next account

3. Provides clear console output with:
   - ✅ Success indicators
   - ❌ Failure indicators
   - Detailed error messages if something fails

## Running the Tests

1. Make sure the main application server is running on localhost:3000

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the test suite:
   ```bash
   npm test
   ```

## Test Messages

- Single messages will be marked with: "[TEST SMS] This is an automated single message test from [USER]'s account"
- Group messages will be marked with: "[TEST SMS] This is an automated group message test from [USER]'s account"

## Results

The test suite will output a summary of results showing:
- Login status for each user
- Single message success/failure
- Group message success/failure

Example output:
```
Test Results Summary
===================

Seantrd:
  Login: ✅
  Single Message: ✅
  Group Message: ✅

Jontrd:
  Login: ✅
  Single Message: ✅
  Group Message: ❌
```

## Troubleshooting

If a test fails:
1. Check the console output for specific error messages
2. Verify the user's SMS Gateway configuration
3. Check the application logs for API errors
4. Verify the test phone numbers are valid and accessible 