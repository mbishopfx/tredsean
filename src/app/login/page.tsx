'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username || !password) {
      setError('Please enter both username and passkey');
      setIsLoading(false);
      return;
    }

    try {
      // Simple passkey check (in a real app, you'd have proper auth)
      if (password === 'admin') {
        // Store auth and username in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        
        // Log the login activity
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: username,
            action: 'login',
            details: {
              timestamp: new Date().toISOString()
            }
          }),
        });
        
        // Redirect to dashboard using window.location for full page refresh
        console.log('Authentication successful, redirecting to dashboard');
        window.location.href = '/';
      } else {
        setError('Invalid passkey');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tech-background relative overflow-hidden">
      {/* Tech-inspired background */}
      <div className="absolute inset-0 bg-grid"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-accent opacity-10 blur-3xl rounded-full"></div>
      <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-gradient opacity-10 blur-3xl rounded-full"></div>
      
      {/* Login card */}
      <div className="w-full max-w-md space-y-8 p-10 bg-glass rounded-xl shadow-tech z-10 tech-border">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">TRD</span> 
            <span className="text-accent">Dialer</span> & SMS
          </h1>
          <p className="mt-2 text-sm text-gray-400">Enter credentials to continue</p>
        </div>

        {error && (
          <div className="p-3 bg-status-danger bg-opacity-20 border border-status-danger border-opacity-40 text-status-danger rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="relative block w-full px-3 py-2 mb-4 bg-tech-input border border-tech-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-tech-foreground"
              placeholder="Username"
            />
            
            <label htmlFor="password" className="sr-only">Passkey</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-tech-foreground"
              placeholder="Enter passkey"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient hover:shadow-accent transition-shadow duration-300"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-400 mt-4">
            <p>Use passkey: <span className="text-primary">admin</span></p>
          </div>
        </form>
      </div>
    </div>
  );
} 