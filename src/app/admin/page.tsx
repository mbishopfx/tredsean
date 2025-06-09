'use client';

import { useState, useEffect } from 'react';

interface AccessLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  authType: string;
  success: boolean;
  passwordAttempt?: string;
  username?: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          type: 'super'
        }),
      });

      const data = await response.json();

      if (data.success && data.role === 'super') {
        setIsAuthenticated(true);
        await loadDashboardData();
      } else {
        setError('Invalid super user password');
      }
    } catch (error) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load access logs
      const logsResponse = await fetch('/api/auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }

      // Load Twilio stats
      const statsResponse = await fetch('/api/twilio/stats?period=all');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAuthTypeLabel = (type: string) => {
    switch (type) {
      case 'site': return 'Site Access';
      case 'super': return 'Super User';
      case 'team': return 'Team Member';
      default: return type;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-tech-background flex items-center justify-center">
        <div className="bg-tech-card rounded-lg shadow-tech p-8 max-w-md w-full mx-4">
          <div className="h-1 bg-gradient rounded-t-lg mb-6"></div>
          
          <h1 className="text-2xl font-bold text-tech-foreground mb-2">Super User Dashboard</h1>
          <p className="text-gray-300 text-sm mb-6">
            Enter the super user password to access system logs and analytics.
          </p>

          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Super User Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter super user password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient text-white rounded-md hover:opacity-90 transition-opacity duration-200"
              disabled={loading || !password}
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tech-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-tech-foreground">Super User Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-tech-card rounded-lg shadow-tech p-6">
            <div className="h-1 bg-gradient rounded-t-lg mb-4"></div>
            <h3 className="text-lg font-semibold text-tech-foreground mb-2">Total Access Attempts</h3>
            <p className="text-3xl font-bold text-primary">{logs.length}</p>
          </div>
          
          <div className="bg-tech-card rounded-lg shadow-tech p-6">
            <div className="h-1 bg-gradient rounded-t-lg mb-4"></div>
            <h3 className="text-lg font-semibold text-tech-foreground mb-2">Successful Logins</h3>
            <p className="text-3xl font-bold text-green-400">{logs.filter(log => log.success).length}</p>
          </div>
          
          <div className="bg-tech-card rounded-lg shadow-tech p-6">
            <div className="h-1 bg-gradient rounded-t-lg mb-4"></div>
            <h3 className="text-lg font-semibold text-tech-foreground mb-2">Failed Attempts</h3>
            <p className="text-3xl font-bold text-red-400">{logs.filter(log => !log.success).length}</p>
          </div>
          
          <div className="bg-tech-card rounded-lg shadow-tech p-6">
            <div className="h-1 bg-gradient rounded-t-lg mb-4"></div>
            <h3 className="text-lg font-semibold text-tech-foreground mb-2">Unique IPs</h3>
            <p className="text-3xl font-bold text-blue-400">
              {new Set(logs.map(log => log.ipAddress)).size}
            </p>
          </div>
        </div>

        {/* Twilio Stats */}
        {stats && (
          <div className="bg-tech-card rounded-lg shadow-tech p-6 mb-8">
            <div className="h-1 bg-gradient rounded-t-lg mb-6"></div>
            <h2 className="text-xl font-semibold text-tech-foreground mb-4">Twilio Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Total Messages</h4>
                <p className="text-2xl font-bold text-tech-foreground">{stats.overview?.totalMessages || 0}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Total Cost</h4>
                <p className="text-2xl font-bold text-tech-foreground">${stats.overview?.totalCost || '0.00'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Delivery Rate</h4>
                <p className="text-2xl font-bold text-tech-foreground">{stats.overview?.deliveryRate || '0'}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Access Logs */}
        <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient"></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-tech-foreground mb-4">Access Logs & IP Tracking</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tech-border">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">IP Address</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Auth Type</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Password Attempted</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-tech-border hover:bg-tech-secondary">
                      <td className="py-3 px-4 text-tech-foreground">{formatDate(log.timestamp)}</td>
                      <td className="py-3 px-4 text-tech-foreground">
                        {log.username ? (
                          <span className="px-2 py-1 bg-blue-900 bg-opacity-20 text-blue-400 rounded text-sm font-medium">
                            {log.username}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-tech-foreground font-mono">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-tech-foreground">{getAuthTypeLabel(log.authType)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.success 
                            ? 'bg-green-900 bg-opacity-20 text-green-400' 
                            : 'bg-red-900 bg-opacity-20 text-red-400'
                        }`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-tech-foreground font-mono">
                        {log.passwordAttempt ? (
                          <span className={`px-2 py-1 rounded-md text-sm ${
                            log.authType === 'site' ? 'bg-blue-900 bg-opacity-20 text-blue-400' : 'bg-gray-900 bg-opacity-20 text-gray-400'
                          }`}>
                            {log.passwordAttempt}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs max-w-xs truncate" title={log.userAgent}>
                        {log.userAgent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No access logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 