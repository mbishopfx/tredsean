// DEFAULT SMS GATEWAY CONFIGURATION
// Jon's Samsung device is the ONLY device that actually delivers messages
// All users should use these credentials for guaranteed delivery

export const DEFAULT_SMS_GATEWAY_CONFIG = {
  provider: 'smsgateway' as const,
  email: 'jon@trurankdigital.com',
  password: 'WorkingDevice123!',
  cloudUsername: 'AD2XA0',
  cloudPassword: '2nitkjiqnmrrtc',
  endpoint: 'https://api.sms-gate.app/3rdparty/v1/message',
  deviceInfo: {
    type: 'Samsung',
    carrier: 'Total Wireless',
    privacyEnabled: true,
    hashingEnabled: true,
    deliveryConfirmed: true
  }
};

// Function to get default SMS credentials for any user
export function getDefaultSMSCredentials() {
  return {
    provider: DEFAULT_SMS_GATEWAY_CONFIG.provider,
    email: DEFAULT_SMS_GATEWAY_CONFIG.email,
    password: DEFAULT_SMS_GATEWAY_CONFIG.password,
    cloudUsername: DEFAULT_SMS_GATEWAY_CONFIG.cloudUsername,
    cloudPassword: DEFAULT_SMS_GATEWAY_CONFIG.cloudPassword,
    endpoint: DEFAULT_SMS_GATEWAY_CONFIG.endpoint
  };
}

// Helper function to format credentials for API calls
export function formatCredentialsForAPI() {
  const creds = DEFAULT_SMS_GATEWAY_CONFIG;
  return `${creds.cloudUsername}:${creds.cloudPassword}`;
}

// Validation function to ensure credentials are working
export function validateWorkingCredentials(cloudUsername: string, cloudPassword: string): boolean {
  return cloudUsername === DEFAULT_SMS_GATEWAY_CONFIG.cloudUsername && 
         cloudPassword === DEFAULT_SMS_GATEWAY_CONFIG.cloudPassword;
}

export default DEFAULT_SMS_GATEWAY_CONFIG; 