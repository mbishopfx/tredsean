# Production Setup Guide - Taking Your Application Out of Demo Mode

This guide will help you configure your Twilio and CloseCRM integrations to fully enable real SMS and CRM functionality.

## Current Status

✅ **CloseCRM Integration**: Partially configured (API key needs verification)  
❌ **Twilio Integration**: Needs your actual credentials  
❌ **SMS Functionality**: Currently in mock mode  

## Step 1: Configure Twilio (Required for SMS)

### 1.1 Get Your Twilio Credentials

1. **Login to your Twilio Account**: Go to [Twilio Console](https://console.twilio.com/)
2. **Get Account SID**: Found on your main dashboard
3. **Get Auth Token**: Click "Show" next to your Auth Token on the dashboard
4. **Get Phone Number**: Go to Phone Numbers > Manage > Active numbers

### 1.2 Update Your Environment Variables

Edit your `.env.local` file and replace the placeholder values:

```env
# Replace these with your actual Twilio credentials:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 1.3 Test Your Twilio Configuration

Run this command to test SMS sending:
```bash
node scripts/test-twilio-sms.js +1234567890
```
(Replace +1234567890 with your phone number)

## Step 2: Configure CloseCRM (Required for Contact Management)

### 2.1 Get Your CloseCRM API Key

1. **Login to Close**: Go to [Close.com](https://app.close.com/)
2. **Go to Settings**: Click your profile > Settings
3. **API Keys**: Navigate to "API Keys" section
4. **Create API Key**: Click "Create API Key" and copy the key

### 2.2 Update Your Environment Variables

Update your `.env.local` file:

```env
# Replace with your actual Close CRM API key:
CLOSE_CRM_API_KEY=api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.3 Test Your CloseCRM Configuration

Run this command to test CRM connectivity:
```bash
node scripts/test-closecrm.js
```

## Step 3: Restart Your Application

After updating your credentials:

1. **Stop the development server** (Ctrl+C in your terminal)
2. **Clear the cache**: `rm -rf .next`
3. **Restart**: `npm run dev`

## Step 4: Verify Everything is Working

### 4.1 Check SMS Functionality
1. Go to your SMS section in the app
2. Send a test message
3. You should no longer see "Twilio credentials not configured" messages

### 4.2 Check CloseCRM Integration
1. Go to the Voice Dialer section
2. Enter a phone number and make a test call
3. Check if contacts are properly loaded from CloseCRM

### 4.3 Check Drip Campaign
1. Go to the Drip Campaign tab
2. Create a test campaign
3. Verify it uses real Twilio sending instead of mock data

## Troubleshooting

### Common Issues:

**"Twilio credentials not configured"**
- Double-check your TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
- Make sure there are no extra spaces or quotes in your .env.local file
- Restart your development server

**"Close CRM API error: Unauthorized"**
- Your CLOSE_CRM_API_KEY may be invalid or expired
- Generate a new API key from your Close account
- Make sure the API key has the necessary permissions

**SMS not sending**
- Verify your Twilio phone number is SMS-enabled
- Check that you have sufficient Twilio account balance
- Ensure phone numbers are in E.164 format (+1234567890)

### Testing Scripts Available:

- `node scripts/test-twilio-sms.js +1234567890` - Test SMS sending
- `node scripts/test-closecrm.js` - Test CRM connection
- `node scripts/test-closecrm-endpoints.js` - Test all CRM endpoints

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys secure and don't share them
- Consider using environment-specific API keys for development vs production

## What Changes After Setup

Once properly configured, your application will:

✅ **Send real SMS messages** via Twilio instead of mock data  
✅ **Load real contacts** from your CloseCRM account  
✅ **Log actual call activities** to CloseCRM  
✅ **Create real opportunities and tasks** in CloseCRM  
✅ **Send drip campaign messages** via real Twilio SMS  

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Run the test scripts to isolate the problem
3. Verify your API credentials are correct and active
4. Check your Twilio account balance and phone number capabilities

Your application is already fully functional - it just needs your real API credentials to replace the demo/mock functionality! 