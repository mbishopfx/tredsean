/**
 * Centralized SMS Gateway Credentials Configuration
 * This file contains all team member SMS Gateway credentials
 * Used across SMS Testing Lab, Advanced Message Sender, and PersonalSMSCredentials components
 */

export interface SMSCredentials {
  provider: 'smsgateway';
  email: string;
  password: string;
  cloudUsername: string;
  cloudPassword: string;
  endpoint: string;
  apiKey?: string;
  deviceId?: string;
}

// Team SMS Gateway Credentials
export const TEAM_SMS_CREDENTIALS: { [username: string]: SMSCredentials } = {
  'Seantrd': {
    provider: 'smsgateway',
    email: 'sean@trurankdigital.com',
    password: 'Croatia5376!',
    cloudUsername: 'YH1NKV',
    cloudPassword: 'obiwpwuzrx5lip',
    endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
  },
  'Matttrd': {
    provider: 'smsgateway',
    email: 'sean@trurankdigital.com',
    password: 'Croatia5376!',
    cloudUsername: 'YH1NKV',
    cloudPassword: 'obiwpwuzrx5lip',
    endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
  },
  'Jontrd': {
    provider: 'smsgateway',
    email: 'jon@trurankdigital.com',
    password: 'WorkingDevice123!',
    cloudUsername: 'AD2XA0',
    cloudPassword: '2nitkjiqnmrrtc',
    endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
  },
  'Juantrd': {
    provider: 'smsgateway',
    email: 'juan@trurankdigital.com',
    password: 'JuanDevice456!',
    cloudUsername: 'GBNSPW',
    cloudPassword: '3nneo5hkbyhpti',
    endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
  },
  'Josetrd': {
    provider: 'smsgateway',
    email: 'jose@trurankdigital.com',
    password: 'JoseDevice789!',
    cloudUsername: '_NNSZW',
    cloudPassword: '9qajexoy9ihhnl',
    endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
  }
};

/**
 * Get SMS credentials for a specific username
 * @param username - The username to get credentials for
 * @returns SMS credentials or null if not found
 */
export function getSMSCredentialsForUser(username: string): SMSCredentials | null {
  return TEAM_SMS_CREDENTIALS[username] || null;
}

/**
 * Initialize SMS credentials for a user in localStorage
 * @param username - The username to initialize credentials for
 * @returns true if credentials were initialized, false if user not found
 */
export function initializeSMSCredentials(username: string): boolean {
  const credentials = getSMSCredentialsForUser(username);
  if (credentials) {
    localStorage.setItem('personalSMSCredentials', JSON.stringify(credentials));
    console.log(`✅ Auto-initialized ${username}'s SMS credentials`);
    return true;
  }
  console.warn(`❌ No SMS credentials found for user: ${username}`);
  return false;
}

/**
 * Get and auto-initialize SMS credentials from localStorage
 * @param username - The username to get/initialize credentials for
 * @returns SMS credentials or null
 */
export function getOrInitializeSMSCredentials(username: string): SMSCredentials | null {
  // Try to get existing credentials
  const storedCredentials = localStorage.getItem('personalSMSCredentials');
  let personalSMSCredentials = storedCredentials ? JSON.parse(storedCredentials) : null;
  
  // Auto-initialize if missing
  if (!personalSMSCredentials && username) {
    const teamCredentials = getSMSCredentialsForUser(username);
    if (teamCredentials) {
      personalSMSCredentials = teamCredentials;
      localStorage.setItem('personalSMSCredentials', JSON.stringify(personalSMSCredentials));
      console.log(`🚀 Auto-initialized ${username}'s SMS Gateway credentials for production`);
    }
  }
  
  // Auto-correct if outdated
  if (personalSMSCredentials && username) {
    const currentCredentials = getSMSCredentialsForUser(username);
    if (currentCredentials && 
        (personalSMSCredentials.cloudUsername !== currentCredentials.cloudUsername || 
         personalSMSCredentials.cloudPassword !== currentCredentials.cloudPassword)) {
      
      personalSMSCredentials = currentCredentials;
      localStorage.setItem('personalSMSCredentials', JSON.stringify(personalSMSCredentials));
      console.log(`🔧 Auto-corrected ${username}'s SMS credentials to current version`);
    }
  }
  
  return personalSMSCredentials;
} 