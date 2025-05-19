'use client';

import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Safe check for browser environment
      const checkAuth = () => {
        setIsAuthenticated(!!localStorage.getItem('isAuthenticated'));
      };
      
      checkAuth();
      
      // Listen for storage events to update auth status
      const handleStorageChange = () => {
        checkAuth();
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);
  
  const toggleAuth = () => {
    if (isAuthenticated) {
      localStorage.removeItem('isAuthenticated');
    } else {
      localStorage.setItem('isAuthenticated', 'true');
    }
    setIsAuthenticated(!isAuthenticated);
  };
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-2 right-2 z-50 bg-tech-secondary p-3 rounded text-xs opacity-80 hover:opacity-100 max-w-xs overflow-auto">
      <div className="font-bold mb-1">Auth Debug:</div>
      <div>Status: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
        {isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </span></div>
      <button 
        className="mt-2 px-2 py-1 bg-tech-input border border-tech-border rounded hover:bg-tech-secondary"
        onClick={toggleAuth}
      >
        {isAuthenticated ? 'Log Out' : 'Force Log In'}
      </button>
      <div className="text-xs opacity-70 mt-1">This debug panel is only visible in development mode</div>
    </div>
  );
} 