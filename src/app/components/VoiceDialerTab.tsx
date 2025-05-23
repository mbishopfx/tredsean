'use client';

import { useState, useEffect } from 'react';

interface VoiceDialerTabProps {
  isActive: boolean;
  logActivity: (action: string, details?: any) => void;
}

export function VoiceDialerTab({ isActive, logActivity }: VoiceDialerTabProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [showCallResults, setShowCallResults] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [contactInfo, setContactInfo] = useState<{ id: string; name: string } | null>(null);
  const [callMode, setCallMode] = useState<'twilio' | 'manual'>('twilio');
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [audioInput, setAudioInput] = useState<string>('default');
  const [audioOutput, setAudioOutput] = useState<string>('default');
  const [audioDevices, setAudioDevices] = useState<{inputs: MediaDeviceInfo[], outputs: MediaDeviceInfo[]}>({
    inputs: [],
    outputs: []
  });

  // Always call useEffect - don't make it conditional
  useEffect(() => {
    async function getAudioDevices() {
      if (typeof window === 'undefined') return;
      
      // Only actually fetch devices when on voice-dialer tab or showing audio settings
      if (isActive || showAudioSettings) {
        try {
          // Request permission to access media devices
          await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Get list of available devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          
          // Filter for audio devices
          const inputs = devices.filter(device => device.kind === 'audioinput');
          const outputs = devices.filter(device => device.kind === 'audiooutput');
          
          setAudioDevices({ inputs, outputs });
        } catch (error) {
          console.error('Error accessing media devices:', error);
        }
      }
    }
    
    getAudioDevices();
  }, [isActive, showAudioSettings]);

  const callOutcomes = [
    "Answered - Interested",
    "Answered - Not Interested", 
    "Answered - Call Back Later",
    "Answered - No Follow Up",
    "Voicemail Left",
    "No Answer",
    "Wrong Number", 
    "Hang Up",
    "Busy Signal",
    "Out of Service",
    "Other"
  ];

  const handleStartCall = async () => {
    if (!phoneNumber.trim()) return;
    
    // Log call attempt
    logActivity('call_attempted', {
      phoneNumber: phoneNumber,
      mode: callMode,
      timestamp: new Date().toISOString()
    });
    
    if (callMode === 'twilio') {
      try {
        const response = await fetch('/api/twilio/start-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phoneNumber,
            audioInput: audioInput,
            audioOutput: audioOutput
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to start call');
        }
        
        setIsCallActive(true);
        setContactInfo({ id: data.contactId || '', name: data.contactName || phoneNumber });
        
        // Log successful call initiation
        logActivity('call_started', {
          phoneNumber: phoneNumber,
          callSid: data.callSid,
          mode: 'twilio'
        });
        
      } catch (error) {
        console.error('Error starting call:', error);
        logActivity('call_failed', {
          phoneNumber: phoneNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          mode: 'twilio'
        });
      }
    } else {
      // Manual mode - just mark as active for logging purposes
      setIsCallActive(true);
      setContactInfo({ id: '', name: phoneNumber });
      
      logActivity('call_started', {
        phoneNumber: phoneNumber,
        mode: 'manual'
      });
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setShowCallResults(true);
    
    logActivity('call_ended', {
      phoneNumber: phoneNumber,
      duration: 'unknown', // Could track actual duration in production
      mode: callMode
    });
  };

  const handleSubmitCallResult = async () => {
    try {
      const response = await fetch('/api/call-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          outcome: callOutcome,
          notes: callNotes,
          contactId: contactInfo?.id,
          contactName: contactInfo?.name,
          callDate: new Date().toISOString(),
          mode: callMode
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save call result');
      }
      
      // Log the call result
      logActivity('call_result_saved', {
        phoneNumber: phoneNumber,
        outcome: callOutcome,
        hasNotes: !!callNotes,
        mode: callMode
      });
      
      // Reset form
      setPhoneNumber('');
      setCallNotes('');
      setCallOutcome('');
      setContactInfo(null);
      setShowCallResults(false);
      
    } catch (error) {
      console.error('Error saving call result:', error);
    }
  };

  const handleAddToPipeline = async () => {
    if (!contactInfo) return;
    
    try {
      const response = await fetch('/api/closecrm/add-to-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contactInfo.id,
          name: contactInfo.name,
          phone: phoneNumber,
          source: 'voice_dialer',
          notes: callNotes,
          outcome: callOutcome
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to pipeline');
      }
      
      logActivity('contact_added_to_pipeline', {
        phoneNumber: phoneNumber,
        contactName: contactInfo.name,
        source: 'voice_dialer'
      });
      
    } catch (error) {
      console.error('Error adding to pipeline:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Call Interface */}
      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
        <div className="h-1 bg-gradient"></div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-tech-foreground mb-4">Voice Dialer</h3>
          
          {!isCallActive ? (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="twilio"
                    checked={callMode === 'twilio'}
                    onChange={(e) => setCallMode(e.target.value as 'twilio' | 'manual')}
                    className="mr-2"
                  />
                  <span className="text-sm text-tech-foreground">Twilio Voice</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={callMode === 'manual'}
                    onChange={(e) => setCallMode(e.target.value as 'twilio' | 'manual')}
                    className="mr-2"
                  />
                  <span className="text-sm text-tech-foreground">Manual Dialing</span>
                </label>
              </div>
              
              {/* Phone Number Input */}
              <div>
                <label htmlFor="phone-number" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Audio Settings for Twilio Mode */}
              {callMode === 'twilio' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowAudioSettings(!showAudioSettings)}
                    className="text-sm text-primary hover:text-primary-light transition-colors duration-200"
                  >
                    {showAudioSettings ? 'Hide' : 'Show'} Audio Settings
                  </button>
                  
                  {showAudioSettings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-tech-secondary rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Microphone
                        </label>
                        <select
                          value={audioInput}
                          onChange={(e) => setAudioInput(e.target.value)}
                          className="w-full px-3 py-2 bg-tech-background border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="default">Default Microphone</option>
                          {audioDevices.inputs.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Speaker
                        </label>
                        <select
                          value={audioOutput}
                          onChange={(e) => setAudioOutput(e.target.value)}
                          className="w-full px-3 py-2 bg-tech-background border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="default">Default Speaker</option>
                          {audioDevices.outputs.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Start Call Button */}
              <button
                onClick={handleStartCall}
                disabled={!phoneNumber.trim()}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Start Call</span>
              </button>
              
              {callMode === 'manual' && (
                <p className="text-sm text-gray-400 text-center mt-2">
                  Manual mode: Dial the number yourself and use this interface to track the call result.
                </p>
              )}
            </div>
          ) : (
            /* Call In Progress */
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-4 h-4 bg-status-success rounded-full animate-pulse"></div>
                <span className="text-lg font-medium text-tech-foreground">
                  {callMode === 'twilio' ? 'Call in progress...' : 'Call manually and track result...'}
                </span>
              </div>
              
              <div className="text-sm text-gray-400">
                Calling: {phoneNumber}
              </div>
              
              <button
                onClick={handleEndCall}
                className="bg-status-danger text-white py-3 px-6 rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18" />
                </svg>
                <span>End Call</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Call Results Form */}
      {showCallResults && (
        <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient-accent"></div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-tech-foreground mb-4">Call Result</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="call-outcome" className="block text-sm font-medium text-gray-300 mb-1">
                  Call Outcome *
                </label>
                <select
                  id="call-outcome"
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select outcome...</option>
                  {callOutcomes.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="call-notes" className="block text-sm font-medium text-gray-300 mb-1">
                  Call Notes
                </label>
                <textarea
                  id="call-notes"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Enter any notes about the call..."
                  rows={4}
                  className="w-full px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitCallResult}
                  disabled={!callOutcome}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Save Result
                </button>
                
                {contactInfo && callOutcome === 'Answered - Interested' && (
                  <button
                    onClick={handleAddToPipeline}
                    className="flex-1 bg-accent text-white py-2 px-4 rounded-md hover:bg-accent-dark transition-colors duration-200"
                  >
                    Add to Pipeline
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 