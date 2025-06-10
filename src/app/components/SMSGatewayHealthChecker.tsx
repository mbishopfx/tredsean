'use client';

import { useState, useEffect } from 'react';

interface HealthStatus {
  isConnected: boolean;
  accountActive: boolean;
  accountEmail?: string;
  lastPing?: string;
  messagesRemaining?: number;
  deviceStatus?: 'online' | 'offline' | 'unknown';
  error?: string;
}

interface SMSGatewayHealthCheckerProps {
  className?: string;
}

export function SMSGatewayHealthChecker({ className = "" }: SMSGatewayHealthCheckerProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isConnected: false,
    accountActive: false,
    deviceStatus: 'unknown'
  });
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkSMSGatewayHealth = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/sms-gateway/health-check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setHealthStatus({
          isConnected: data.isConnected || false,
          accountActive: data.accountActive || false,
          accountEmail: data.accountEmail || 'sean@trurankdigital.com',
          lastPing: data.lastPing || new Date().toISOString(),
          messagesRemaining: data.messagesRemaining || 'unlimited',
          deviceStatus: data.deviceStatus || 'online',
          error: data.error
        });
      } else {
        setHealthStatus({
          isConnected: false,
          accountActive: false,
          deviceStatus: 'offline',
          error: data.error || 'Health check failed'
        });
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check error:', error);
      setHealthStatus({
        isConnected: false,
        accountActive: false,
        deviceStatus: 'offline',
        error: 'Network error during health check'
      });
      setLastCheck(new Date());
    } finally {
      setChecking(false);
    }
  };

  // Auto-check on mount and every 5 minutes
  useEffect(() => {
    checkSMSGatewayHealth();
    const interval = setInterval(checkSMSGatewayHealth, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (checking) return 'yellow';
    if (healthStatus.isConnected && healthStatus.accountActive) return 'green';
    if (healthStatus.isConnected && !healthStatus.accountActive) return 'yellow';
    return 'red';
  };

  const getStatusText = () => {
    if (checking) return 'Checking...';
    if (healthStatus.isConnected && healthStatus.accountActive) return 'Healthy';
    if (healthStatus.isConnected && !healthStatus.accountActive) return 'Limited';
    return 'Offline';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <div className={`bg-tech-card rounded-lg shadow-tech overflow-hidden ${className}`}>
      <div className={`h-1 ${
        statusColor === 'green' ? 'bg-gradient-to-r from-green-500 to-green-400' :
        statusColor === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
        'bg-gradient-to-r from-red-500 to-red-400'
      }`}></div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H7V6h10v10z"/>
            </svg>
            SMS Gateway Status
          </h3>
          
          <button
            onClick={checkSMSGatewayHealth}
            disabled={checking}
            className="p-2 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Main Status Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${
              statusColor === 'green' ? 'bg-green-400 animate-pulse-slow' :
              statusColor === 'yellow' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400 animate-pulse-fast'
            }`}></span>
            <span className={`font-medium ${
              statusColor === 'green' ? 'text-green-400' :
              statusColor === 'yellow' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {statusText}
            </span>
          </div>
          
          {healthStatus.deviceStatus && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              healthStatus.deviceStatus === 'online' ? 'bg-green-900 bg-opacity-20 text-green-400' :
              healthStatus.deviceStatus === 'offline' ? 'bg-red-900 bg-opacity-20 text-red-400' :
              'bg-gray-800 bg-opacity-20 text-gray-400'
            }`}>
              Device {healthStatus.deviceStatus}
            </span>
          )}
        </div>

        {/* Detailed Status */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Account:</span>
            <span className="text-tech-foreground">
              {healthStatus.accountEmail || 'Unknown'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Connection:</span>
            <span className={`${healthStatus.isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {healthStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Account Status:</span>
            <span className={`${healthStatus.accountActive ? 'text-green-400' : 'text-yellow-400'}`}>
              {healthStatus.accountActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {healthStatus.messagesRemaining && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Messages Left:</span>
              <span className="text-tech-foreground">
                {typeof healthStatus.messagesRemaining === 'number' 
                  ? healthStatus.messagesRemaining.toLocaleString()
                  : healthStatus.messagesRemaining
                }
              </span>
            </div>
          )}

          {lastCheck && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Last Check:</span>
              <span className="text-tech-foreground text-xs">
                {lastCheck.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {healthStatus.error && (
          <div className="mt-3 p-2 bg-red-900 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <span>{healthStatus.error}</span>
            </div>
          </div>
        )}

        {/* Only Sean's account should be active notice */}
        {healthStatus.accountEmail && healthStatus.accountEmail !== 'sean@trurankdigital.com' && (
          <div className="mt-3 p-2 bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded text-yellow-400 text-xs">
            <div className="flex items-start">
              <svg className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>
                Note: Only Sean's account should be active until cloud server setup is complete for your team.
              </span>
            </div>
          </div>
        )}

        {/* Success message for Sean's account */}
        {healthStatus.isConnected && healthStatus.accountActive && healthStatus.accountEmail === 'sean@trurankdigital.com' && (
          <div className="mt-3 p-2 bg-green-900 bg-opacity-20 border border-green-500 rounded text-green-400 text-xs">
            <div className="flex items-start">
              <svg className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>
                ✓ SMS Gateway is healthy and ready for mass messaging campaigns.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 