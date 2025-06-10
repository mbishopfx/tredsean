'use client';

interface TwilioBackupGuideProps {
  isActive: boolean;
}

export function TwilioBackupGuide({ isActive }: TwilioBackupGuideProps) {
  if (!isActive) return null;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold">Twilio Backup Setup</h2>
          <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-yellow-400 flex items-center">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
            Emergency Backup Only
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Guide */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Setting Up Your Twilio Backup Number
              </h3>
              
              <div className="space-y-6">
                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-md p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-yellow-400 font-medium">Important Notice</p>
                      <p className="text-yellow-300 text-sm mt-1">
                        The SMS Gateway using your personal phone is our primary method. Twilio is only recommended as a backup for critical emergencies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">1</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Create Twilio Account</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Visit <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">twilio.com</a> and sign up for a new account. You'll get $15 in free credits to start.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">2</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Purchase a Phone Number</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Go to Phone Numbers → Manage → Buy a number. Choose a local number that matches your business area. Cost: ~$1/month.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">3</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Get API Credentials</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Navigate to Settings → General → API Keys & Tokens. Copy your Account SID and Auth Token.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">4</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Configure Environment</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Add your credentials to the system environment variables (contact your team lead for setup).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">5</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Test & Verify</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Send a test message through the campaign tool to ensure everything works correctly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Calculator & Benefits */}
          <div className="space-y-6">
            {/* Cost Calculator */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.59 10.76C10.21 11.13 10 11.63 10 12.17V23H12V18H14V23H16V12.17C16 11.63 15.79 11.13 15.41 10.76L13.93 9.28L16.83 6.38L19.5 9.05L21 7.55V9H21Z"/>
                  </svg>
                  Backup Cost Analysis
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Phone Number (monthly):</span>
                    <span className="text-tech-foreground">$1.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Per SMS sent:</span>
                    <span className="text-tech-foreground">$0.0075</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Per SMS received:</span>
                    <span className="text-tech-foreground">$0.0075</span>
                  </div>
                  <div className="border-t border-tech-border pt-2 mt-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-300">Est. 1000 msgs/month:</span>
                      <span className="text-green-400">~$16.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                
                <div className="space-y-3">
                  <a
                    href="https://console.twilio.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-tech-foreground">Twilio Console</div>
                      <div className="text-xs text-gray-400">Manage your account & numbers</div>
                    </div>
                  </a>

                  <a
                    href="https://www.twilio.com/docs/sms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M19,19H5V5H19V19Z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-tech-foreground">SMS Documentation</div>
                      <div className="text-xs text-gray-400">Technical setup guide</div>
                    </div>
                  </a>

                  <a
                    href="https://support.twilio.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-tech-foreground">Support Center</div>
                      <div className="text-xs text-gray-400">Get help when needed</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
              <h4 className="text-red-400 font-medium mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Need Help?
              </h4>
              <p className="text-red-300 text-sm">
                If you need immediate assistance setting up Twilio backup, contact your team lead or tech support for guided setup.
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-8 bg-tech-secondary bg-opacity-20 border border-tech-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Current SMS System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-900 bg-opacity-20 border border-green-500 rounded-md">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                <span className="text-green-400 font-medium">SMS Gateway (Primary)</span>
              </div>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-20 border border-gray-600 rounded-md">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
                <span className="text-gray-400 font-medium">Twilio (Backup)</span>
              </div>
              <span className="text-gray-400 text-sm">Standby</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Your personal phone SMS Gateway is currently handling all messaging. Twilio backup will only be used if the primary system fails.
          </p>
        </div>
      </div>
    </div>
  );
} 