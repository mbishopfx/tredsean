'use client';

import { useState, useRef } from 'react';

interface TestResult {
  phoneNumber: string;
  status: 'success' | 'failed';
  message: string;
  timestamp: Date;
}

interface ConsoleLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const TEST_CONTACTS = [
  { phone: '+14176297373', name: 'Test Contact 1', company: 'Test Company A', title: 'Manager', location: 'Test Location A' },
  { phone: '+16094805199', name: 'Test Contact 2', company: 'Test Company B', title: 'Director', location: 'Test Location B' },
  { phone: '+13473803274', name: 'Test Contact 3', company: 'Test Company C', title: 'Coordinator', location: 'Test Location C' },
  { phone: '+17542832309', name: 'Test Contact 4', company: 'Test Company D', title: 'Specialist', location: 'Test Location D' }
];

const TEST_MESSAGE = `Hi {name}! This is a PRE-CAMPAIGN TEST MESSAGE from True Rank Digital.

We're testing our SMS system before launching campaigns for {company}. As a {title} in {location}, you'd normally receive personalized outreach about digital marketing solutions.

This is NOT a real campaign - just a system test. Please ignore this message.

- TRD Testing Team`;

export default function SMSTestingLab() {
  const [isTestingSingle, setIsTestingSingle] = useState(false);
  const [isTestingMass, setIsTestingMass] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [singlePhone, setSinglePhone] = useState('');
  const [testMessage, setTestMessage] = useState(TEST_MESSAGE);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addConsoleLog = (message: string, type: ConsoleLog['type'] = 'info') => {
    setConsoleLogs(prev => [...prev, {
      timestamp: new Date(),
      message,
      type
    }]);
    
    setTimeout(() => {
      const consoleContainer = consoleEndRef.current?.parentElement;
      if (consoleContainer) {
        const isNearBottom = consoleContainer.scrollTop + consoleContainer.clientHeight >= consoleContainer.scrollHeight - 50;
        if (isNearBottom) {
          consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const copyConsoleLogs = async () => {
    const logText = consoleLogs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(logText);
      addConsoleLog('📋 Console logs copied to clipboard', 'info');
    } catch (error) {
      console.error('Failed to copy logs:', error);
    }
  };

  const personalizeMessage = (message: string, contact: any) => {
    let personalized = message;
    Object.entries(contact).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`{${key}}`, 'gi');
        personalized = personalized.replace(regex, value.toString());
      }
    });
    return personalized;
  };

  const sendTestMessage = async (phoneNumber: string, message: string, contactData?: any) => {
    try {
      // Use the EXACT same logic as AdvancedMessageSender - no fallbacks, no account switching
      let storedCredentials = localStorage.getItem('personalSMSCredentials');
      let personalSMSCredentials = storedCredentials ? JSON.parse(storedCredentials) : null;
      
      console.log('🔍 Debug - Raw stored credentials string:', storedCredentials);
      console.log('🔍 Debug - Parsed credentials object:', personalSMSCredentials);
      
      // AUTO-INITIALIZE CREDENTIALS for production readiness based on username
      const username = localStorage.getItem('username');
      
      // Define team member credentials
      const teamCredentials: { [key: string]: any } = {
        'Seantrd': {
          provider: 'smsgateway',
          email: 'sean@trurankdigital.com',
          password: 'Croatia5376!',
          cloudUsername: 'YH1NKV',
          cloudPassword: 'obiwpwuzrx5lip',
          endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
        },
        'Matttrd': {
          provider: 'smsgateway',
          email: 'sean@trurankdigital.com',
          password: 'Croatia5376!',
          cloudUsername: 'YH1NKV',
          cloudPassword: 'obiwpwuzrx5lip',
          endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
        },
        'Jontrd': {
          provider: 'smsgateway',
          email: 'jon@trurankdigital.com',
          password: 'WorkingDevice123!',
          cloudUsername: 'AD2XA0',
          cloudPassword: '2nitkjiqnmrrtc',
          endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
        },
        'Juantrd': {
          provider: 'smsgateway',
          email: 'juan@trurankdigital.com',
          password: 'JuanDevice456!',
          cloudUsername: 'GBNSPW',
          cloudPassword: '3nneo5hkbyhpti',
          endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
        },
        'Josetrd': {
          provider: 'smsgateway',
          email: 'jose@trurankdigital.com',
          password: 'JoseDevice789!',
          cloudUsername: '_NNSZW',
          cloudPassword: '9qajexoy9ihhnl',
          endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
        }
      };
      
      if (!personalSMSCredentials && username && teamCredentials[username]) {
        console.log(`🚀 Auto-initializing ${username}'s SMS Gateway credentials for production...`);
        personalSMSCredentials = teamCredentials[username];
        
        // Save the credentials to localStorage for future use
        localStorage.setItem('personalSMSCredentials', JSON.stringify(personalSMSCredentials));
        console.log(`✅ Auto-initialized ${username}'s credentials saved to localStorage`);
      }
      
      // FORCE FIX: If credentials are wrong for any user, auto-correct them
      if (username && teamCredentials[username] && personalSMSCredentials) {
        // Check if these are outdated credentials for any user
        const currentCredentials = teamCredentials[username];
        if (personalSMSCredentials.cloudUsername !== currentCredentials.cloudUsername || 
            personalSMSCredentials.cloudPassword !== currentCredentials.cloudPassword) {
          
          console.log(`🔧 FORCE-FIXING ${username}'s credentials to current ones...`);
          
          // Set the correct credentials for this user
          personalSMSCredentials = currentCredentials;
          
          // Save the corrected credentials
          localStorage.setItem('personalSMSCredentials', JSON.stringify(personalSMSCredentials));
          console.log(`✅ Updated ${username}'s credentials saved to localStorage`);
        }
      }
      
      console.log('🔍 Debug - Final credentials being used:', {
        exists: !!personalSMSCredentials,
        provider: personalSMSCredentials?.provider,
        hasEmail: !!personalSMSCredentials?.email,
        hasPassword: !!personalSMSCredentials?.password,
        cloudUsername: personalSMSCredentials?.cloudUsername,
        cloudPassword: personalSMSCredentials?.cloudPassword ? 'exists' : 'missing',
        allKeys: personalSMSCredentials ? Object.keys(personalSMSCredentials) : []
      });
      
      if (!personalSMSCredentials) {
        throw new Error('Personal SMS credentials not found. Please log in again.');
      }

      // Transform credentials for SMS Gateway compatibility (exact same as Message Sender)
      const transformedCredentials = personalSMSCredentials?.provider === 'smsgateway' ? {
        ...personalSMSCredentials,
        // Ensure both email/password AND cloudUsername/cloudPassword are passed
        email: personalSMSCredentials.email,
        password: personalSMSCredentials.password,
        cloudUsername: personalSMSCredentials.cloudUsername,
        cloudPassword: personalSMSCredentials.cloudPassword,
        username: personalSMSCredentials.cloudUsername || personalSMSCredentials.username,
        provider: 'smsgateway'
      } : personalSMSCredentials;

      console.log('🔍 Debug - Sending to API with credentials:', {
        provider: transformedCredentials.provider,
        cloudUsername: transformedCredentials.cloudUsername,
        endpoint: '/api/sms/send'
      });

      // Use the exact same API endpoint and request format as Message Sender
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumbers: [phoneNumber],
          message,
          provider: 'personal',
          credentials: transformedCredentials,
          contactData: contactData ? [contactData] : [{ phone: phoneNumber }],
          campaignId: `test_${Date.now()}`
        }),
      });

      if (!response) {
        throw new Error('No response received from SMS gateway');
      }

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Message sent successfully' };
      } else {
        return { success: false, message: data.error || 'Failed to send message' };
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const saveToSupabase = async (testData: any) => {
    try {
      const username = localStorage.getItem('username') || 'unknown';
      
      // Send to Supabase via our API (skip if env vars not configured)
      const response = await fetch('/api/supabase/save-test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          testData,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        addConsoleLog('💾 Test results saved to database', 'info');
      } else {
        // Don't show error if Supabase is not configured
        addConsoleLog('ℹ️ Test completed (database not configured)', 'info');
      }
    } catch (error) {
      // Don't show error if Supabase is not configured
      addConsoleLog('ℹ️ Test completed (database not configured)', 'info');
    }
  };

  const handleSingleTest = async () => {
    if (!singlePhone.trim() || isTestingSingle) return;
    
    setIsTestingSingle(true);
    addConsoleLog(`🧪 Starting single SMS test to ${singlePhone}...`, 'info');
    
    const result = await sendTestMessage(singlePhone, testMessage);
    
    const testResult: TestResult = {
      phoneNumber: singlePhone,
      status: result.success ? 'success' : 'failed',
      message: result.message,
      timestamp: new Date()
    };
    
    setTestResults(prev => [testResult, ...prev]);
    
    if (result.success) {
      addConsoleLog(`✅ Single test completed successfully for ${singlePhone}`, 'success');
    } else {
      addConsoleLog(`❌ Single test failed for ${singlePhone}: ${result.message}`, 'error');
    }
    
    // Save to Supabase
    await saveToSupabase({
      testType: 'single_test',
      phoneNumber: singlePhone,
      success: result.success,
      message: result.message,
      consoleLogs: consoleLogs.slice(-10).map(log => ({
        timestamp: log.timestamp.toISOString(),
        message: log.message,
        type: log.type
      }))
    });
    
    setIsTestingSingle(false);
  };

  const handleMassTest = async () => {
    if (isTestingMass) return;
    
    setIsTestingMass(true);
    addConsoleLog(`🚀 Starting mass SMS test campaign to ${TEST_CONTACTS.length} contacts...`, 'info');
    
    const results: TestResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < TEST_CONTACTS.length; i++) {
      const contact = TEST_CONTACTS[i];
      const personalizedMessage = personalizeMessage(testMessage, contact);
      
      addConsoleLog(`📱 Testing contact ${i + 1}/${TEST_CONTACTS.length}: ${contact.name} (${contact.phone})`, 'info');
      
      const result = await sendTestMessage(contact.phone, personalizedMessage, contact);
      
      const testResult: TestResult = {
        phoneNumber: contact.phone,
        status: result.success ? 'success' : 'failed',
        message: result.message,
        timestamp: new Date()
      };
      
      results.push(testResult);
      
      if (result.success) {
        successCount++;
        addConsoleLog(`✅ Test ${i + 1} successful: ${contact.name}`, 'success');
      } else {
        failedCount++;
        addConsoleLog(`❌ Test ${i + 1} failed: ${contact.name} - ${result.message}`, 'error');
      }
      
      // Add delay between messages for mass test
      if (i < TEST_CONTACTS.length - 1) {
        addConsoleLog(`⏳ Waiting 2 seconds before next test...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setTestResults(prev => [...results, ...prev]);
    
    const finalLogMessage = `🎯 Mass test campaign completed! Success: ${successCount}, Failed: ${failedCount}`;
    addConsoleLog(finalLogMessage, successCount > failedCount ? 'success' : 'warning');
    
    // Save campaign results to Supabase
    await saveToSupabase({
      testType: 'mass_campaign',
      totalContacts: TEST_CONTACTS.length,
      successCount,
      failedCount,
      results,
      consoleLogs: consoleLogs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        message: log.message,
        type: log.type
      }))
    });
    
    setIsTestingMass(false);
  };

  return (
    <div className="min-h-screen bg-tech-background p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SMS Testing Lab</h1>
            <p className="text-blue-200 mt-1">Advanced SMS system testing before live campaigns</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Testing Controls */}
        <div className="xl:col-span-2 space-y-6">
          {/* Single Test */}
          <div className="bg-tech-card rounded-lg shadow-tech border border-tech-border">
            <div className="h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Single SMS Test
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test Phone Number
                  </label>
                  <input
                    type="tel"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full p-3 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <button
                  onClick={handleSingleTest}
                  disabled={isTestingSingle || !singlePhone.trim()}
                  className={`w-full px-6 py-3 rounded-md flex items-center justify-center space-x-2 text-white font-medium transition-all duration-300 ${
                    isTestingSingle || !singlePhone.trim()
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  {isTestingSingle ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Test Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mass Test */}
          <div className="bg-tech-card rounded-lg shadow-tech border border-tech-border">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Mass Campaign Test
              </h3>
              
              <div className="space-y-4">
                <div className="bg-tech-input border border-tech-border rounded-lg p-4">
                  <h4 className="font-medium text-gray-300 mb-2">Test Contacts ({TEST_CONTACTS.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {TEST_CONTACTS.map((contact, index) => (
                      <div key={index} className="text-sm text-gray-400 flex items-center justify-between">
                        <span>{contact.name} - {contact.company}</span>
                        <span className="text-xs text-gray-500">{contact.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleMassTest}
                  disabled={isTestingMass}
                  className={`w-full px-6 py-3 rounded-md flex items-center justify-center space-x-2 text-white font-medium transition-all duration-300 ${
                    isTestingMass
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'
                  }`}
                >
                  {isTestingMass ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Running Campaign Test...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Start Mass Test ({TEST_CONTACTS.length} contacts)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Test Message Template */}
          <div className="bg-tech-card rounded-lg shadow-tech border border-tech-border">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Test Message Template</h3>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full min-h-[120px] p-3 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                placeholder="Enter your test message template..."
              />
              <div className="text-xs text-gray-400 mt-2">
                Available variables: {'{name}'}, {'{company}'}, {'{title}'}, {'{location}'}
              </div>
            </div>
          </div>
        </div>

        {/* Console and Results */}
        <div className="space-y-6">
          {/* Console Output */}
          <div className="bg-tech-card rounded-lg shadow-tech border border-tech-border">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Test Console</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{consoleLogs.length} entries</span>
                  <button
                    onClick={copyConsoleLogs}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded hover:bg-tech-secondary flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-tech-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="bg-[#1E1E1E] rounded-lg p-3 h-[300px] overflow-y-auto font-mono text-sm">
                {consoleLogs.map((log, index) => (
                  <div key={index} className="mb-2 leading-relaxed">
                    <span className="text-gray-500 text-xs">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`ml-2 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-tech-card rounded-lg shadow-tech border border-tech-border">
            <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Test Results</h3>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No test results yet</p>
                    <p className="text-sm">Run a test to see results here</p>
                  </div>
                ) : (
                  testResults.slice(0, 10).map((result, index) => (
                    <div key={index} className={`p-3 rounded-md border ${
                      result.status === 'success' 
                        ? 'bg-green-900/20 border-green-500/30 text-green-300'
                        : 'bg-red-900/20 border-red-500/30 text-red-300'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{result.phoneNumber}</span>
                        <span className="text-xs">{result.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm opacity-75">{result.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 