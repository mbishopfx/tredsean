import { useCallback } from 'react';

// Custom hook for logging user activity
export function useActivityLogger() {
  // Function to log an activity
  const logActivity = useCallback(async (action: string, details?: any) => {
    try {
      // Get the currently logged in user from localStorage
      // In this app, we only store 'isAuthenticated' but not the username
      // For now, we'll extract username from localStorage if available or use 'unknown'
      let user = 'unknown';
      
      // In a production app, you would get the actual username from your auth system
      // This is just a simple implementation
      if (typeof window !== 'undefined') {
        // Try to extract user from localStorage if available
        try {
          const storedUser = localStorage.getItem('username');
          if (storedUser) {
            user = storedUser;
          }
        } catch (e) {
          console.error('Error accessing localStorage:', e);
        }
      }
      
      // Send the activity log to the API
      const response = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          action,
          details
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to log activity');
      }
      
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, []);
  
  return { logActivity };
} 