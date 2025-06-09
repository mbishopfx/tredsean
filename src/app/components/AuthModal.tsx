import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (role: string, userInfo?: any) => void;
  type: 'site' | 'super' | 'team';
  title: string;
  description: string;
}

export function AuthModal({ isOpen, onClose, onAuthenticate, type, title, description }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
          username: type === 'team' ? username : undefined,
          password,
          type
        }),
      });

      const data = await response.json();

      if (data.success) {
        onAuthenticate(data.role, data.userInfo);
        onClose();
        setUsername('');
        setPassword('');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-tech-card rounded-lg shadow-tech p-6 max-w-md w-full mx-4">
        <div className="h-1 bg-gradient rounded-t-lg mb-6"></div>
        
        <h2 className="text-xl font-semibold text-tech-foreground mb-2">{title}</h2>
        <p className="text-gray-300 text-sm mb-6">{description}</p>

        <form onSubmit={handleSubmit}>
          {type === 'team' && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
              required
              autoFocus={type !== 'team'}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-tech-secondary border border-tech-border rounded-md text-gray-300 hover:bg-tech-muted transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient text-white rounded-md hover:opacity-90 transition-opacity duration-200"
              disabled={loading || !password || (type === 'team' && !username)}
            >
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 