'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  details?: any;
}

export default function ActivityLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [filter, setFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [timePeriod, setTimePeriod] = useState<'1d' | '7d' | '30d' | 'all'>('all');

  // Check authentication and access
  useEffect(() => {
    const checkAuth = () => {
      try {
        const auth = localStorage.getItem('isAuthenticated');
        const username = localStorage.getItem('username');
        
        setIsAuthenticated(!!auth);
        
        if (!auth) {
          router.push('/');
          return;
        }
        
        // Check if user is Matt or Jon
        const isAuthorized = username === 'Matttrd' || username === 'Jontrd';
        setHasAccess(isAuthorized);
        
        if (!isAuthorized) {
          // Don't redirect, just show access denied
          setLoading(false);
          return;
        }
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/');
      }
    };
    
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [router]);

  // Fetch logs
  useEffect(() => {
    if (!isAuthenticated || !hasAccess) return;
    
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/activity-logs?${userFilter ? `username=${userFilter}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity logs');
        }
        
        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [isAuthenticated, hasAccess, userFilter]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Filter logs based on search input and time period
  const filteredLogs = logs.filter(log => {
    const searchMatch = filter === '' || 
      log.user.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(filter.toLowerCase());
      
    const actionMatch = actionFilter === '' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    
    // Apply time period filter
    const now = new Date();
    const logDate = new Date(log.timestamp);
    let timePeriodMatch = true;
    
    if (timePeriod === '1d') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      timePeriodMatch = logDate >= yesterday;
    } else if (timePeriod === '7d') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      timePeriodMatch = logDate >= lastWeek;
    } else if (timePeriod === '30d') {
      const lastMonth = new Date(now);
      lastMonth.setDate(now.getDate() - 30);
      timePeriodMatch = logDate >= lastMonth;
    }
    
    return searchMatch && actionMatch && timePeriodMatch;
  });

  // Get unique users from logs
  const uniqueUsers = Array.from(new Set(logs.map(log => log.user)));
  
  // Get unique actions from logs
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Show access denied for non-authorized users
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-tech-background">
        {/* Header */}
        <header className="bg-tech-elevation-1 border-b border-tech-border p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-primary">TRD</span> 
                <span className="text-accent">Dialer</span> & SMS
              </Link>
              <span className="text-sm bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Access Denied</span>
            </div>
            <Link href="/" className="px-4 py-2 text-sm text-tech-foreground hover:bg-tech-elevation-2 rounded transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="bg-tech-card rounded-lg shadow-tech p-8 max-w-md w-full mx-4">
            <div className="h-1 bg-red-500 rounded-t-lg mb-6"></div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-tech-foreground mb-2">Access Restricted</h1>
              <p className="text-gray-400 mb-6">
                Activity logs are only accessible to system administrators.
              </p>
              
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-gradient-accent text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-tech-background">
      {/* Header */}
      <header className="bg-tech-elevation-1 border-b border-tech-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-primary">TRD</span> 
              <span className="text-accent">Dialer</span> & SMS
            </Link>
            <span className="text-sm bg-accent/20 text-accent px-2 py-0.5 rounded">Admin</span>
          </div>
          <Link href="/" className="px-4 py-2 text-sm text-tech-foreground hover:bg-tech-elevation-2 rounded transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Activity Logs</h1>
          <div className="flex gap-2">
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as any)}
              className="px-3 py-2 bg-tech-input border border-tech-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Time</option>
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select 
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 bg-tech-input border border-tech-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-tech-input border border-tech-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-tech-input border border-tech-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-accent animate-pulse">Loading activity logs...</div>
          </div>
        ) : error ? (
          <div className="bg-status-danger bg-opacity-20 border border-status-danger text-status-danger p-4 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-tech-elevation-1 rounded-lg border border-tech-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-tech-elevation-2 border-b border-tech-border">
                    <th className="text-left p-4 font-medium">Timestamp</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Action</th>
                    <th className="text-left p-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-gray-400">
                        No activity logs found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <tr key={index} className="border-b border-tech-border hover:bg-tech-elevation-2 transition-colors">
                        <td className="p-4 font-mono text-sm">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-1 bg-accent/20 text-accent rounded text-sm">
                            {log.user}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-1 bg-tech-secondary rounded text-sm">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4">
                          {log.details && (
                            <details className="cursor-pointer">
                              <summary className="text-sm text-gray-400 hover:text-gray-300">
                                View details
                              </summary>
                              <pre className="mt-2 text-xs bg-tech-background p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 