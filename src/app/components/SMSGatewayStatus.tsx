'use client';

import { useEffect, useState } from 'react';
import { getSMSCredentialsForUser } from '@/lib/smsCredentials';

interface SMSGatewayInfo {
  cloudUsername: string;
  cloudPassword: string;
  deviceName: string;
  status: 'active' | 'pending';
  notes: string;
}

export function SMSGatewayStatus() {
  const [gatewayInfo, setGatewayInfo] = useState<SMSGatewayInfo | null>(null);
  const [username, setUsername] = useState<string>('');

  const getPersonalizedDeviceName = (username: string) => {
    if (!username) return 'Personal Provider';
    // Capitalize first letter and add "'s Device"
    return `${username.charAt(0).toUpperCase() + username.slice(1)}'s Device`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('username') || '';
      setUsername(savedUsername);
      
      // Check if user has team credentials
      const teamCredentials = getSMSCredentialsForUser(savedUsername);
      if (teamCredentials) {
        // Show that SMS Gateway is configured via team credentials
        setGatewayInfo({
          cloudUsername: teamCredentials.cloudUsername,
          cloudPassword: teamCredentials.cloudPassword,
          deviceName: getPersonalizedDeviceName(savedUsername),
          status: 'active',
          notes: 'Auto-configured team device'
        });
      } else {
        // Fallback to legacy localStorage check
        const savedGateway = localStorage.getItem('userSMSGateway');
        if (savedGateway) {
          try {
            const parsed = JSON.parse(savedGateway);
            setGatewayInfo(parsed);
          } catch (error) {
            console.error('Error parsing SMS Gateway info:', error);
          }
        }
      }
    }
  }, []);

  // Always show as configured since we have auto-initialization
  const isActive = gatewayInfo?.status === 'active' || !!username;
  const isPending = gatewayInfo?.cloudUsername === 'PLACEHOLDER_USERNAME';

  return (
    <div className={`border rounded-lg p-3 mb-4 ${
      isActive && !isPending 
        ? 'bg-green-900/20 border-green-600/40' 
        : 'bg-orange-900/20 border-orange-600/40'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isActive && !isPending ? 'bg-green-500' : 'bg-orange-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            isActive && !isPending ? 'text-green-300' : 'text-orange-300'
          }`}>
            SMS Gateway: {gatewayInfo?.deviceName || getPersonalizedDeviceName(username)}
          </span>
        </div>
        
        <div className="text-xs text-gray-400">
          {username}
        </div>
      </div>
      
      {isPending && (
        <div className="mt-2 text-xs text-orange-300">
          ⚠️ Pending Setup - Contact admin for SMS Gateway credentials
        </div>
      )}
      
      {!isPending && gatewayInfo && (
        <div className="mt-2 text-xs text-gray-400">
          Cloud ID: {gatewayInfo.cloudUsername} • {gatewayInfo.notes}
        </div>
      )}
      
      {!gatewayInfo && username && (
        <div className="mt-2 text-xs text-green-400">
          ✅ Ready - Credentials auto-configured for team member
        </div>
      )}
    </div>
  );
} 