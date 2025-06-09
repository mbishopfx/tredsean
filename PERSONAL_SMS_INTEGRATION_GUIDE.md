# Personal SMS Gateway Integration Guide

## Overview
This guide will help you integrate personal phone numbers into your dialer system using SMS gateway services instead of Twilio. This will significantly reduce costs while allowing you to use your own phone numbers for bulk messaging.

## SMS Gateway Options Comparison

### Option 1: SMS Dove
- **Website**: https://www.smsdove.com/
- **Free Tier**: 2 Device IDs for free
- **Pricing**: Pay-per-use after free tier
- **Platform**: Android only
- **API**: Simple REST API
- **Best For**: Small to medium volume, testing

### Option 2: SMSMobileAPI  
- **Website**: https://smsmobileapi.com/
- **Free Tier**: Limited free usage
- **Pricing**: Subscription-based plans
- **Platform**: Android and iPhone support
- **API**: Comprehensive REST API with webhooks
- **Best For**: Higher volume, enterprise features

## Cost Analysis for 10,000 Messages

### Current Twilio Cost:
- **10,000 SMS**: ~$75.00 (at $0.0075 per message)
- **Monthly for 10k**: $75.00

### Personal SMS Gateway Cost:

#### SMS Dove:
- **Setup Cost**: Free (2 devices)
- **Message Cost**: $0 (uses your unlimited text plan)
- **Phone Plan Cost**: ~$30-50/month per line (unlimited text)
- **Total for 10k messages**: $30-50/month (just your phone plan)
- **Savings**: ~$25-45/month (33-60% savings)

#### SMSMobileAPI:
- **Free Plan**: Up to 100 messages/day (3,000/month) - FREE
- **Basic Plan**: $9.99/month for 10,000 messages
- **Phone Plan Cost**: ~$30-50/month per line
- **Total for 10k messages**: $39.99-59.99/month  
- **Savings**: ~$15-35/month (20-47% savings)

### Recommended Setup:
**2-3 Android phones with unlimited text plans + SMS gateway service**
- **Total Cost**: $60-150/month (depending on plans)
- **Message Capacity**: 20,000-50,000+ messages/month
- **Savings vs Twilio**: 50-80% cost reduction

## Implementation Plan

### Phase 1: Setup and Testing

#### Step 1: Choose Your SMS Gateway Service
**Recommended**: Start with **SMSMobileAPI** for better features and reliability

#### Step 2: Hardware Requirements
- **Minimum**: 1 Android phone (Android 5.0+)
- **Recommended**: 2-3 Android phones for redundancy and higher volume
- **Requirements**: 
  - Stable WiFi or mobile data connection
  - Unlimited text messaging plan
  - Keep phones plugged in and always connected

#### Step 3: Environment Variables Setup
Add these to your `.env.local` file:

```bash
# SMS Provider Selection
SMS_PROVIDER=personal  # or 'twilio' for fallback

# Personal SMS Gateway Configuration (choose one)
# For SMSMobileAPI
SMSMOBILE_API_KEY=your-api-key-here
SMSMOBILE_DEVICE_ID=your-device-id-here
SMSMOBILE_API_URL=https://api.smsmobileapi.com

# For SMS Dove  
SMSDOVE_API_KEY=your-api-key-here
SMSDOVE_DEVICE_ID=your-device-id-here
SMSDOVE_API_URL=https://api.smsdove.com

# Failover Configuration
ENABLE_SMS_FAILOVER=true
FAILOVER_TO_TWILIO=true
```

### Phase 2: Code Implementation

#### Step 1: Create SMS Service Abstraction
Create `src/app/lib/sms-service.ts`:

```typescript
interface SMSMessage {
  phone: string;
  message: string;
}

interface SMSResult {
  phone: string;
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
}

export class SMSService {
  private primaryProvider: string;
  private enableFailover: boolean;

  constructor() {
    this.primaryProvider = process.env.SMS_PROVIDER || 'twilio';
    this.enableFailover = process.env.ENABLE_SMS_FAILOVER === 'true';
  }

  async sendMessages(messages: SMSMessage[]): Promise<SMSResult[]> {
    try {
      // Try primary provider first
      return await this.sendWithProvider(messages, this.primaryProvider);
    } catch (error) {
      if (this.enableFailover && this.primaryProvider !== 'twilio') {
        console.log('Primary SMS provider failed, falling back to Twilio...');
        return await this.sendWithProvider(messages, 'twilio');
      }
      throw error;
    }
  }

  private async sendWithProvider(messages: SMSMessage[], provider: string): Promise<SMSResult[]> {
    const endpoint = provider === 'personal' ? '/api/personal-sms/send' : '/api/twilio/send-sms';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`SMS API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((result: any) => ({
      ...result,
      provider
    }));
  }
}
```

#### Step 2: Create Personal SMS API Endpoint
Create `src/app/api/personal-sms/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface MessageData {
  phone: string;
  message: string;
}

interface SendSMSRequest {
  messages: MessageData[];
  messageText?: string;
  phoneNumbers?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Determine which SMS gateway to use
    const provider = process.env.SMSMOBILE_API_KEY ? 'smsmobile' : 'smsdove';
    
    let apiKey: string | undefined;
    let deviceId: string | undefined;  
    let apiUrl: string | undefined;

    if (provider === 'smsmobile') {
      apiKey = process.env.SMSMOBILE_API_KEY;
      deviceId = process.env.SMSMOBILE_DEVICE_ID;
      apiUrl = process.env.SMSMOBILE_API_URL;
    } else {
      apiKey = process.env.SMSDOVE_API_KEY;
      deviceId = process.env.SMSDOVE_DEVICE_ID;
      apiUrl = process.env.SMSDOVE_API_URL;
    }
    
    if (!apiKey || !deviceId || !apiUrl) {
      return NextResponse.json({ 
        error: `${provider} SMS gateway configuration missing. Check environment variables.` 
      }, { status: 500 });
    }
    
    const data: SendSMSRequest = await request.json();
    
    let messagesToSend: MessageData[] = [];
    
    // Handle both message formats for compatibility
    if (data.messages && Array.isArray(data.messages)) {
      messagesToSend = data.messages;
    } else if (data.messageText && data.phoneNumbers && Array.isArray(data.phoneNumbers)) {
      messagesToSend = data.phoneNumbers.map(phone => ({
        phone,
        message: data.messageText as string
      }));
    } else {
      return NextResponse.json({ 
        error: 'Invalid request format. Expected messages array or messageText and phoneNumbers.' 
      }, { status: 400 });
    }

    if (messagesToSend.length === 0) {
      return NextResponse.json({ 
        error: 'No valid messages to send.' 
      }, { status: 400 });
    }

    console.log(`Sending ${messagesToSend.length} SMS messages via ${provider}...`);
    
    // Send messages through personal SMS gateway
    const results = await Promise.all(
      messagesToSend.map(async ({ phone, message }) => {
        try {
          let requestBody: any;
          let endpoint: string;

          if (provider === 'smsmobile') {
            // SMSMobileAPI format
            endpoint = `${apiUrl}/v1/sms/send`;
            requestBody = {
              apikey: apiKey,
              phone: phone,
              message: message
            };
          } else {
            // SMS Dove format
            endpoint = `${apiUrl}/api/send-sms`;
            requestBody = {
              device_id: deviceId,
              phone: phone,
              message: message
            };
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(provider === 'smsmobile' ? {} : { 'Authorization': `Bearer ${apiKey}` })
            },
            body: JSON.stringify(requestBody),
          });
          
          const result = await response.json();
          
          if (response.ok && (result.success || result.status === 'success')) {
            return {
              phone,
              success: true,
              messageId: result.message_id || result.id,
              status: 'sent',
              provider
            };
          } else {
            throw new Error(result.error || result.message || 'Failed to send SMS');
          }
        } catch (error: any) {
          console.error(`Error sending SMS to ${phone} via ${provider}:`, error.message);
          return {
            phone,
            success: false,
            error: error.message,
            provider
          };
        }
      })
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${successful} message(s), ${failed} failed via ${provider}.`,
      results,
      provider
    });
    
  } catch (error: any) {
    console.error('Error in Personal SMS API:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while sending SMS messages.' 
    }, { status: 500 });
  }
}
```

#### Step 3: Update Main Application
Modify your existing `handleSendMessages` function in `src/app/page.tsx`:

```typescript
// Add import at the top
import { SMSService } from './lib/sms-service';

// Update the handleSendMessages function
const handleSendMessages = async () => {
  if (!messageText || phoneNumbers.length === 0) {
    setSendStatus({
      success: false,
      message: 'Please enter a message and select phone numbers'
    });
    return;
  }

  if (isSending) return;
  
  setIsSending(true);
  setSendStatus(null);
  
  try {
    // Prepare messages with template variables replaced
    const messages = phoneNumbers.map(phone => {
      const contact = contactData.find(c => c.phone === phone) || { phone };
      
      let personalizedMessage = messageText;
      personalizedMessage = personalizedMessage.replace(/{name}/g, contact.name || "there");
      personalizedMessage = personalizedMessage.replace(/{company}/g, contact.company || "");
      personalizedMessage = personalizedMessage.replace(/{phone}/g, phone);
      personalizedMessage = personalizedMessage.replace(/{date}/g, new Date().toLocaleDateString());
      personalizedMessage = personalizedMessage.replace(/{time}/g, new Date().toLocaleTimeString());
      
      return { phone, message: personalizedMessage };
    });

    // Use SMS service with automatic failover
    const smsService = new SMSService();
    const results = await smsService.sendMessages(messages);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const provider = results[0]?.provider || 'unknown';
    
    setSendStatus({
      success: successful > 0,
      message: `Successfully sent ${successful} message(s), ${failed} failed via ${provider}.`
    });

    // Log activity
    logActivity('bulk_sms_sent', {
      total: messages.length,
      successful,
      failed,
      provider,
      messageLength: messageText.length
    });
    
  } catch (error: any) {
    console.error('Error sending messages:', error);
    setSendStatus({
      success: false,
      message: error.message || 'An error occurred while sending messages.'
    });
  } finally {
    setIsSending(false);
  }
};
```

## Getting API Keys - Step-by-Step Instructions

### Option 1: SMSMobileAPI (Recommended)

#### Step 1: Sign Up
1. Go to https://smsmobileapi.com/
2. Click "Sign Up" or "Get Started"
3. Create your account with email and password
4. Verify your email address

#### Step 2: Download and Setup Android App
1. Download the SMSMobileAPI app from Google Play Store
2. Install on your Android phone(s)
3. Log in with your account credentials
4. Grant all required permissions (SMS, Phone, etc.)

#### Step 3: Get API Key and Device ID
1. In the web dashboard, go to "API Keys" section
2. Generate a new API key
3. Copy the API key (keep it secure)
4. In the mobile app, go to Settings
5. Note down your Device ID
6. Keep the app running and connected

#### Step 4: Test Connection
1. In the web dashboard, try sending a test SMS
2. Verify it sends from your phone
3. Check delivery status

### Option 2: SMS Dove (Alternative)

#### Step 1: Sign Up
1. Go to https://www.smsdove.com/
2. Click "Sign up"  
3. Create account and verify email
4. You get 2 free Device IDs

#### Step 2: Download Android App
1. Download SMS Dove app from their website or app store
2. Install on Android phone
3. Log in with your credentials

#### Step 3: Configure Device
1. In app settings, enter your Device ID and Access Code
2. Wait for successful server connection
3. Keep app running in background

#### Step 4: Get API Credentials
1. In web dashboard, find your API documentation
2. Note your Device ID and Access Code
3. Test sending via API

## Testing and Deployment Checklist

### Pre-Deployment Testing
- [ ] SMS gateway app installed and connected
- [ ] API keys configured in environment variables
- [ ] Test single SMS send through new endpoint
- [ ] Test bulk SMS (start with 5-10 messages)
- [ ] Verify message delivery and status tracking
- [ ] Test failover to Twilio (if configured)

### Production Deployment
- [ ] Update environment variables on production server
- [ ] Deploy new code with SMS service abstraction
- [ ] Monitor first batch of messages closely
- [ ] Set up alerting for failed messages
- [ ] Document any carrier limitations discovered

### Ongoing Monitoring
- [ ] Track delivery rates compared to Twilio
- [ ] Monitor daily message limits per device
- [ ] Watch for carrier spam filtering
- [ ] Keep devices charged and connected
- [ ] Regular backup testing of Twilio failover

## Troubleshooting Common Issues

### Message Not Sending
1. Check device internet connection
2. Verify SMS gateway app is running
3. Check API key and device ID configuration
4. Look for carrier daily limits
5. Test with different phone numbers

### High Failure Rate
1. Check phone number formatting
2. Verify unlimited text plan is active
3. Test from different devices
4. Check for carrier spam filtering
5. Reduce sending speed/volume

### App Disconnections
1. Disable battery optimization for SMS app
2. Keep devices plugged in
3. Use stable WiFi connection
4. Set up multiple devices for redundancy

## Next Steps After Setup

1. **Start Small**: Test with 100-500 messages first
2. **Monitor Performance**: Track delivery rates vs Twilio
3. **Scale Gradually**: Add more devices as volume increases
4. **Optimize Costs**: Fine-tune phone plans and gateway services
5. **Backup Strategy**: Keep Twilio as failover option

## Estimated Timeline
- **Setup and Testing**: 2-3 days
- **Code Integration**: 1-2 days  
- **Production Testing**: 1 week
- **Full Deployment**: 1-2 weeks

## Support Resources
- SMSMobileAPI Documentation: https://smsmobileapi.com/docs
- SMS Dove API Docs: https://www.smsdove.com/api
- Community forums and support tickets available on both platforms

---

**Ready to get started?** Follow the API key setup instructions above and let's integrate your personal SMS gateway! 