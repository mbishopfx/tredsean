import { useState, useEffect } from 'react';

interface PersonalSMSCredentials {
  apiKey: string;
  deviceId: string;
  provider: 'smsmobile' | 'smsdove' | 'smsgateway';
  email?: string;
  password?: string;
}

interface PersonalSMSCredentialsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: PersonalSMSCredentials) => void;
}

export function PersonalSMSCredentials({ isOpen, onClose, onSave }: PersonalSMSCredentialsProps) {
  const [credentials, setCredentials] = useState<PersonalSMSCredentials>({
    apiKey: '',
    deviceId: '',
    provider: 'smsgateway',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSeanAccount, setIsSeanAccount] = useState(false);

  // Check if this is Sean's account and pre-fill credentials
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      if (username === 'Matttrd' || username === 'Seantrd') {
        setIsSeanAccount(true);
        setCredentials({
          apiKey: '',
          deviceId: '',
          provider: 'smsgateway',
          email: 'sean@trurankdigital.com',
          password: 'Croatia5376!'
        });
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate credentials based on provider
    if (credentials.provider === 'smsgateway') {
      if (!credentials.email || !credentials.password) {
        setError('Please fill in email and password for SMS Gateway');
        setLoading(false);
        return;
      }
    } else {
      if (!credentials.apiKey || !credentials.deviceId) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
    }

    try {
      // Test the credentials with a simple validation call
      // You could add a test endpoint here if needed
      onSave(credentials);
      onClose();
      setCredentials({ apiKey: '', deviceId: '', provider: 'smsgateway', email: '', password: '' });
    } catch (error) {
      setError('Failed to validate credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalSMSCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-tech-card rounded-lg shadow-tech p-6 max-w-lg w-full mx-4">
        <div className="h-1 bg-gradient rounded-t-lg mb-6"></div>
        
        <h2 className="text-xl font-semibold text-tech-foreground mb-2">Personal SMS Gateway Setup</h2>
        {isSeanAccount ? (
          <div className="mb-6 p-4 bg-green-900 bg-opacity-20 border border-green-500 rounded-md">
            <h3 className="text-green-400 font-medium mb-2">✅ Sean's SMS Gateway - Pre-Configured</h3>
            <p className="text-green-300 text-sm">
              Your SMS Gateway is already set up and working! These credentials are hardcoded and connected to your cloud server.
            </p>
          </div>
        ) : (
          <p className="text-gray-300 text-sm mb-6">
            Enter the credentials from your SMS gateway app. You can get these from the app settings on your phone.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-2">
              SMS Gateway Provider {isSeanAccount && <span className="text-green-400">(Default for Sean)</span>}
            </label>
            <select
              id="provider"
              value={credentials.provider}
              onChange={(e) => handleInputChange('provider', e.target.value as 'smsmobile' | 'smsdove' | 'smsgateway')}
              className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSeanAccount}
            >
              <option value="smsgateway">SMS Gateway (Recommended)</option>
              <option value="smsmobile">SMSMobileAPI</option>
              <option value="smsdove">SMS Dove</option>
            </select>
          </div>

          {credentials.provider === 'smsgateway' ? (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email {isSeanAccount && <span className="text-green-400">(Pre-configured)</span>}
                </label>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your SMS Gateway email"
                  required
                  readOnly={isSeanAccount}
                  disabled={isSeanAccount}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password {isSeanAccount && <span className="text-green-400">(Pre-configured)</span>}
                </label>
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your SMS Gateway password"
                  required
                  readOnly={isSeanAccount}
                  disabled={isSeanAccount}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={credentials.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your API key from the app"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="deviceId" className="block text-sm font-medium text-gray-300 mb-2">
                  Device ID
                </label>
                <input
                  id="deviceId"
                  type="text"
                  value={credentials.deviceId}
                  onChange={(e) => handleInputChange('deviceId', e.target.value)}
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your device ID from the app"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-md">
            <h3 className="text-blue-400 font-medium mb-2">How to get your credentials:</h3>
            <div className="text-blue-300 text-sm space-y-1">
              {credentials.provider === 'smsgateway' ? (
                <>
                  <p>• Install SMS Gateway app (APK from GitHub)</p>
                  <p>• Log in with your Google account</p>
                  <p>• Use the same email and password you set up</p>
                  <p>• App will handle the rest automatically</p>
                </>
              ) : credentials.provider === 'smsmobile' ? (
                <>
                  <p>• Download SMSMobileAPI app from Play Store</p>
                  <p>• Create account and log in</p>
                  <p>• Go to Dashboard → API Keys to get your API Key</p>
                  <p>• Go to Mobile App → Settings to get your Device ID</p>
                </>
              ) : (
                <>
                  <p>• Download SMS Dove app</p>
                  <p>• Create account and get your Device IDs</p>
                  <p>• API Key is your Access Code</p>
                  <p>• Device ID is shown in the app settings</p>
                </>
              )}
            </div>
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
              disabled={loading || (credentials.provider === 'smsgateway' ? (!credentials.email || !credentials.password) : (!credentials.apiKey || !credentials.deviceId))}
            >
              {loading ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 