'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGateway = localStorage.getItem('userSMSGateway');
      const savedUsername = localStorage.getItem('username') || '';
      
      setUsername(savedUsername);
      
      if (savedGateway) {
        try {
          const parsed = JSON.parse(savedGateway);
          setGatewayInfo(parsed);
        } catch (error) {
          console.error('Error parsing SMS Gateway info:', error);
        }
      }
    }
  }, []);

  if (!gatewayInfo) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-yellow-300 text-sm">SMS Gateway: Not configured</span>
        </div>
      </div>
    );
  }

  const isActive = gatewayInfo.status === 'active';
  const isPending = gatewayInfo.cloudUsername === 'PLACEHOLDER_USERNAME';

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
            SMS Gateway: {gatewayInfo.deviceName}
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
      
      {!isPending && (
        <div className="mt-2 text-xs text-gray-400">
          Cloud ID: {gatewayInfo.cloudUsername} • {gatewayInfo.notes}
        </div>
      )}
    </div>
  );
} 