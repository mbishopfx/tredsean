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

interface PersonalSMSCredentials {
  apiKey?: string;
  deviceId?: string;
  provider: 'smsmobile' | 'smsdove';
  token?: string;
  accountId?: string;
  accessCode?: string;
  clientId?: string;
  clientSecret?: string;
}

export class SMSService {
  private primaryProvider: string;
  private enableFailover: boolean;
  private personalCredentials?: PersonalSMSCredentials;

  constructor(personalCredentials?: PersonalSMSCredentials) {
    this.primaryProvider = process.env.SMS_PROVIDER || 'twilio';
    this.enableFailover = process.env.ENABLE_SMS_FAILOVER === 'true';
    this.personalCredentials = personalCredentials;
  }

  async sendMessages(messages: SMSMessage[], usePersonal: boolean = false, personalCreds?: PersonalSMSCredentials): Promise<SMSResult[]> {
    try {
      const provider = usePersonal ? 'personal' : 'twilio';
      
      // If using personal SMS, we need credentials
      if (usePersonal && personalCreds) {
        this.personalCredentials = personalCreds;
      }
      
      return await this.sendWithProvider(messages, provider);
    } catch (error) {
      if (this.enableFailover && usePersonal) {
        console.log('Personal SMS provider failed, falling back to Twilio...');
        return await this.sendWithProvider(messages, 'twilio');
      }
      throw error;
    }
  }

  private async sendWithProvider(messages: SMSMessage[], provider: string): Promise<SMSResult[]> {
    let endpoint: string;
    let requestBody: any;

    if (provider === 'personal') {
      endpoint = '/api/personal-sms/send';
      requestBody = {
        messages,
        credentials: this.personalCredentials
      };
    } else {
      endpoint = '/api/twilio/send-sms';
      requestBody = { messages };
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
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

// Utility function to validate personal SMS credentials
export function validatePersonalSMSCredentials(credentials: PersonalSMSCredentials): boolean {
  const basicValid = !!(credentials.provider);
  
  // For SMSMobile, we need apiKey and optionally clientId/clientSecret for OAuth
  if (credentials.provider === 'smsmobile') {
    return basicValid && !!credentials.apiKey; // clientId/clientSecret are optional but recommended
  }
  
  // For SMS Dove, we need token and accountId
  if (credentials.provider === 'smsdove') {
    return basicValid && !!credentials.token && !!credentials.accountId;
  }
  
  return basicValid;
} 