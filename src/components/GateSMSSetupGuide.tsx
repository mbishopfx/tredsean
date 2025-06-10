'use client';

import React from 'react';

interface GateSMSSetupGuideProps {
  isActive: boolean;
}

const GateSMSSetupGuide: React.FC<GateSMSSetupGuideProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold">GateSMS Setup Guide</h2>
          <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Primary SMS System
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Guide */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Setting Up Your Android SMS Gateway
              </h3>
              
              <div className="space-y-6">
                <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-md p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-blue-400 font-medium">Primary SMS Method</p>
                      <p className="text-blue-300 text-sm mt-1">
                        This Android SMS Gateway is our main messaging system, offering unlimited texts through your personal device.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">1</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Download GateSMS APK</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Download the official Android SMS Gateway app from{' '}
                        <a href="https://github.com/capcom6/android-sms-gateway/releases/latest/download/app-release.apk" 
                           target="_blank" rel="noopener noreferrer" 
                           className="text-green-400 hover:text-green-300 underline">
                          GitHub releases
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">2</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Install on Android Device</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Enable "Unknown Sources" in Android settings, then install the APK. Grant all necessary permissions (SMS, Phone, Contacts).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">3</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Configure Network Settings</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Set up your device name, configure the API endpoint, and generate authentication credentials within the app.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">4</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">TRD System Integration</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Provide your device credentials to{' '}
                        <a href="mailto:bishop@truerankdigital.com" className="text-green-400 hover:text-green-300">
                          bishop@truerankdigital.com
                        </a>{' '}
                        for system integration.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">5</div>
                    <div>
                      <h4 className="font-medium text-tech-foreground">Test & Verify</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Send test messages through the TRD Message Sender to confirm everything works correctly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits & Links */}
          <div className="space-y-6">
            {/* Benefits */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.59 10.76C10.21 11.13 10 11.63 10 12.17V23H12V18H14V23H16V12.17C16 11.63 15.79 11.13 15.41 10.76L13.93 9.28L16.83 6.38L19.5 9.05L21 7.55V9H21Z"/>
                  </svg>
                  SMS Gateway Benefits
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-tech-foreground">Unlimited messages with phone plan</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-tech-foreground">No per-message API costs</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-tech-foreground">Real phone number reputation</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-tech-foreground">Two-way messaging support</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-tech-foreground">Higher delivery rates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                
                <div className="space-y-3">
                  <a
                    href="https://github.com/capcom6/android-sms-gateway/releases/latest/download/app-release.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-tech-foreground">Download APK</div>
                      <div className="text-xs text-gray-400">Official Android SMS Gateway app</div>
                    </div>
                  </a>

                  <a
                    href="https://github.com/capcom6/android-sms-gateway"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-tech-foreground">GitHub Repository</div>
                      <div className="text-xs text-gray-400">Documentation & source code</div>
                    </div>
                  </a>

                  <a
                    href="mailto:bishop@truerankdigital.com"
                    className="flex items-center p-3 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-tech-foreground">Get Setup Help</div>
                      <div className="text-xs text-gray-400">Contact admin for integration</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Need Setup Assistance?
              </h4>
              <p className="text-yellow-300 text-sm">
                This setup requires admin coordination. Contact{' '}
                <a href="mailto:bishop@truerankdigital.com" className="text-yellow-200 underline">
                  bishop@truerankdigital.com
                </a>{' '}
                for step-by-step setup guidance and system integration.
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
            Your personal phone SMS Gateway is our primary messaging system. Twilio backup is available for emergencies when needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GateSMSSetupGuide; 