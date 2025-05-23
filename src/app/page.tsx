'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { useActivityLogger } from './hooks/useActivityLogger';

// Create a loading component
const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-tech-background">
    <div className="text-center">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-tech-foreground">Loading...</h2>
    </div>
  </div>
);

// Icons for the sidebar
const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
  </svg>
);

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
);

const StatsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const AIIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.051l.693.308a2.25 2.25 0 11-2.8 3.085l-4.182-2.608M19.25 4.46l-4.532 7.794a2.25 2.25 0 001.937 3.363h0a2.25 2.25 0 002.013-1.244l4.096-8.242"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
  </svg>
);

const DripCampaignIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z M7 12l3 3L18 7"></path>
  </svg>
);

// Dashboard component
function DashboardContent() {
  const { logActivity } = useActivityLogger();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('message-editor');
  
  // Message Editor state
  const [messageText, setMessageText] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Add new state for contact source selection and CRM contacts
  const [contactSource, setContactSource] = useState<'crm' | 'file'>('file');
  const [crmContacts, setCrmContacts] = useState<any[]>([]);
  const [selectedCrmContacts, setSelectedCrmContacts] = useState<any[]>([]);
  const [loadingCrmContacts, setLoadingCrmContacts] = useState(false);
  const [crmContactSearch, setCrmContactSearch] = useState('');
  const [crmContactsPage, setCrmContactsPage] = useState(1);
  const [showContactFormat, setShowContactFormat] = useState(false);
  
  // SMS Chats state
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  
  // Add state to track previous total message count for notification
  const [previousTotalMessages, setPreviousTotalMessages] = useState(0);
  // Add audio ref for notification sound
  const notificationSound = useRef<HTMLAudioElement>(null);
  
  // Voice Dialer State
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
  
  // Stats state
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  
  // AI Rebuttal Generator state
  const [rebuttalInput, setRebuttalInput] = useState('');
  const [rebuttalResponse, setRebuttalResponse] = useState<string | null>(null);
  const [isGeneratingRebuttal, setIsGeneratingRebuttal] = useState(false);
  const [rebuttalError, setRebuttalError] = useState<string | null>(null);
  const [recentRebuttals, setRecentRebuttals] = useState<Array<{input: string, response: string}>>([]);
  
  // Add a new state variable for the add to pipeline loading state
  const [addingToPipeline, setAddingToPipeline] = useState(false);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);
  
  // Add a new state variable for contact data
  const [contactData, setContactData] = useState<Array<{
    phone: string,
    name?: string,
    company?: string,
    email?: string,
    [key: string]: any
  }>>([]);

  // Drip Campaign state
  const [dripCampaigns, setDripCampaigns] = useState<any[]>([]);
  const [loadingDripCampaigns, setLoadingDripCampaigns] = useState(false);
  const [selectedDripCampaign, setSelectedDripCampaign] = useState<string | null>(null);
  const [dripCampaignForm, setDripCampaignForm] = useState({
    name: '',
    messageTemplates: Array(9).fill('').map((_, index) => ({ 
      day: [1, 3, 5, 7, 9, 11, 13, 15, 17][index], 
      message: '', 
      active: true 
    })),
    contactSource: 'file' as 'crm' | 'file',
    selectedContacts: [] as any[],
    variables: ['name', 'company', 'phone', 'email', 'location', 'date', 'time'] as string[]
  });
  const [creatingDripCampaign, setCreatingDripCampaign] = useState(false);
  const [dripCampaignStats, setDripCampaignStats] = useState<any>(null);
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('active');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [managingCampaign, setManagingCampaign] = useState<string | null>(null);
  const [campaignSummary, setCampaignSummary] = useState<any>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add function to fetch contacts from CloseCRM
  const fetchCrmContacts = async (page = 1, query = '') => {
    if (contactSource !== 'crm') return;
    
    setLoadingCrmContacts(true);
    
    try {
      const response = await fetch(`/api/closecrm/list-contacts?page=${page}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contacts');
      }
      
      setCrmContacts(data.contacts || []);
      setCrmContactsPage(page);
    } catch (error) {
      console.error('Error fetching CRM contacts:', error);
      // Leave previous contacts if there was an error
    } finally {
      setLoadingCrmContacts(false);
    }
  };

  // Check if user is authenticated - use a single useEffect for all initialization
  useEffect(() => {
    // Prevent hydration mismatch by only running auth check on client after mount
    const checkAuth = () => {
      try {
        // UNPROTECTED: Auto-authenticate for deployment
        // Only set authenticated state after client-side mount to prevent hydration mismatch
        setIsAuthenticated(true);
        setLoading(false);
        
        // Set default username for activity logging (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', 'demo-user');
          logActivity('page_view', { page: 'dashboard' });
        }
      } catch (error) {
        // This will catch any errors if localStorage isn't available yet
        console.error('Auth check error:', error);
        // Still set as authenticated for deployment
        setIsAuthenticated(true);
        setLoading(false);
      }
    };
    
    // Only run this on the client, after mount to prevent hydration issues
    checkAuth();
  }, [logActivity]);
  
  // Get available audio devices - must be in consistent hook order
  useEffect(() => {
    async function getAudioDevices() {
      if (typeof window === 'undefined') return;
      
      // Only actually fetch devices when on voice-dialer tab or showing audio settings
      if (activeTab === 'voice-dialer' || showAudioSettings) {
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
  }, [activeTab, showAudioSettings]);
  
  // Fetch SMS conversations when the SMS Chats tab is active
  useEffect(() => {
    async function fetchConversations() {
      if (activeTab !== 'sms-chats') return;
      
      setLoadingConversations(true);
      
      try {
        const response = await fetch('/api/twilio/conversations');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch conversations');
        }
        
        setConversations(data.conversations || []);
        
        // Check for new messages and play notification sound if needed
        const currentTotalMessages = data.conversations?.reduce((total: number, conv: any) => {
          // Count inbound messages received in the last hour
          const recentMessages = conv.messages?.filter((m: any) => 
            m.direction === 'inbound' && 
            new Date(m.dateCreated) > new Date(Date.now() - 60 * 60 * 1000)
          ).length || 0;
          
          return total + recentMessages;
        }, 0) || 0;
        
        if (previousTotalMessages > 0 && currentTotalMessages > previousTotalMessages) {
          // Play notification sound
          notificationSound.current?.play().catch(err => console.log("Could not play notification sound:", err));
        }
        
        // Update previous total messages
        setPreviousTotalMessages(currentTotalMessages);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    }
    
    fetchConversations();
    
    // Set up auto-refresh every 30 seconds while tab is active
    let intervalId: NodeJS.Timeout;
    if (activeTab === 'sms-chats') {
      intervalId = setInterval(fetchConversations, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, previousTotalMessages]);
  
  // Fetch messages for the selected conversation
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedConversation) {
        setConversationMessages([]);
        return;
      }
      
      setLoadingMessages(true);
      
      try {
        const response = await fetch(`/api/twilio/conversations?phoneNumber=${encodeURIComponent(selectedConversation)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch messages');
        }
        
        setConversationMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    }
    
    fetchMessages();
  }, [selectedConversation]);
  
  // Fetch SMS stats when the Stats tab is active
  useEffect(() => {
    async function fetchStats() {
      if (activeTab !== 'stats') return;
      
      setStatsLoading(true);
      setStatsError(null);
      
      try {
        const response = await fetch(`/api/twilio/stats?period=${statsPeriod}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch statistics');
        }
        
        setStatsData(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setStatsLoading(false);
      }
    }
    
    fetchStats();
  }, [activeTab, statsPeriod]);
  
  // Fetch CRM contacts when contact source changes to 'crm' or search term changes
  useEffect(() => {
    // Only actually fetch if source is CRM
    if (contactSource === 'crm') {
      fetchCrmContacts(1, crmContactSearch);
    }
  }, [contactSource, crmContactSearch]);
  
  // Fetch drip campaigns when tab becomes active or filters change
  useEffect(() => {
    if (activeTab === 'drip-campaign') {
      fetchDripCampaigns();
    }
  }, [activeTab, campaignFilter, campaignSearch]);
  
  // Function to generate rebuttal
  const handleGenerateRebuttal = async () => {
    if (!rebuttalInput.trim()) {
      setRebuttalError('Please enter an objection or scenario first');
      return;
    }
    
    setIsGeneratingRebuttal(true);
    setRebuttalError(null);
    
    try {
      const response = await fetch('/api/ai/rebuttal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objection: rebuttalInput,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate rebuttal');
      }
      
      setRebuttalResponse(data.rebuttal);
      
      // Add to recent rebuttals
      setRecentRebuttals(prev => [
        { input: rebuttalInput, response: data.rebuttal },
        ...prev.slice(0, 4) // Keep only last 5 rebuttals
      ]);
      
    } catch (error) {
      console.error('Error generating rebuttal:', error);
      setRebuttalError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsGeneratingRebuttal(false);
    }
  };
  
  // Show loading state or prevent hydration mismatch
  if (!isAuthenticated || loading) {
    return (
      <LoadingScreen />
    );
  }

  // Prevent hydration mismatch - don't render main content until client-side
  if (!isAuthenticated) {
    return (
      <LoadingScreen />
    );
  }

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

  const handleSignOut = () => {
    // Log sign out activity before removing authentication
    const username = (typeof window !== 'undefined' ? localStorage.getItem('username') : null) || 'demo-user';
    logActivity('logout');
    
    // UNPROTECTED DEPLOYMENT: Prevent actual logout
    alert('Sign out disabled for demo deployment. Refresh page to continue.');
    
    // COMMENTED OUT: Actual logout functionality
    // if (typeof window !== 'undefined') {
    //   localStorage.removeItem('isAuthenticated');
    //   localStorage.removeItem('username');
    //   window.location.href = '/login';
    // }
  };

  // Update handleFileChange to set contact data
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    try {
      const text = await file.text();
      // Handle both CSV and plain text formats
      let numbers: string[] = [];
      let parsedContactData: Array<{phone: string, name?: string, company?: string}> = [];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        // Handle CSV format - extract all data from columns
        const lines = text.split('\n');
        // Check for header row
        let headerRow = lines[0].toLowerCase();
        let hasHeader = headerRow.includes('phone') || headerRow.includes('name') || headerRow.includes('company');
        
        // Determine column positions
        let phoneCol = 0, nameCol = 1, companyCol = 2;
        
        if (hasHeader) {
          const headers = headerRow.split(',').map(h => h.trim());
          phoneCol = headers.findIndex(h => h.includes('phone'));
          nameCol = headers.findIndex(h => h === 'name');
          companyCol = headers.findIndex(h => h === 'company');
          
          // Default to first column for phone if not found
          if (phoneCol === -1) phoneCol = 0;
        }
        
        // Start from row after header if there's a header
        const startIndex = hasHeader ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const columns = line.split(',').map(col => col.trim());
            
            if (columns.length > 0 && columns[phoneCol]) {
              const phoneNumber = columns[phoneCol];
              numbers.push(phoneNumber);
              
              const contact: {phone: string, name?: string, company?: string} = {
                phone: phoneNumber
              };
              
              // Add name if available
              if (nameCol >= 0 && columns[nameCol]) {
                contact.name = columns[nameCol];
              }
              
              // Add company if available
              if (companyCol >= 0 && columns[companyCol]) {
                contact.company = columns[companyCol];
              }
              
              parsedContactData.push(contact);
            }
          }
        }
      } else {
        // Handle plain text format - one number per line
        numbers = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
          
        // With plain text, we just have phone numbers
        parsedContactData = numbers.map(number => ({ phone: number }));
      }
      
      setPhoneNumbers(numbers);
      setContactData(parsedContactData);
      
      console.log(`Loaded ${parsedContactData.length} contacts with data:`, parsedContactData);
      
    } catch (error) {
      console.error('Error reading file:', error);
      setSendStatus({
        success: false,
        message: 'Failed to read file. Please make sure it\'s a valid text or CSV file.'
      });
    }
  };

  // Update handleSelectCrmContact to update contact data
  const handleSelectCrmContact = (contact: any) => {
    // Check if contact is already selected
    const isSelected = selectedCrmContacts.some(c => c.id === contact.id);
    
    if (isSelected) {
      // Remove from selected contacts
      setSelectedCrmContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      // Add to selected contacts
      setSelectedCrmContacts(prev => [...prev, contact]);
    }
    
    // Get all phone numbers
    const contactPhones = contact.phones.map((p: any) => p.number);
    
    // Update phone numbers list based on selected contacts
    const updatedPhoneNumbers = !isSelected 
      ? [...phoneNumbers, ...contactPhones]  // Add new phone numbers
      : phoneNumbers.filter(num => !contactPhones.includes(num));  // Remove phone numbers
    
    setPhoneNumbers(updatedPhoneNumbers);
    
    // Update contact data for template variables
    if (isSelected) {
      // Remove this contact's data
      setContactData(prev => prev.filter(c => !contactPhones.includes(c.phone)));
    } else {
      // Add this contact's data
      const newContactData = contact.phones.map((phone: any) => ({
        phone: phone.number,
        name: contact.name,
        company: contact.leadName,
        email: contact.emails?.[0]?.email
      }));
      
      setContactData(prev => [...prev, ...newContactData]);
    }
  };

  // Update handleSendMessages to use template variables
  const handleSendMessages = async () => {
    if (!messageText || phoneNumbers.length === 0) {
      setSendStatus({
        success: false,
        message: 'Please enter a message and select phone numbers'
      });
      return;
    }

    if (isSending) return;
    
    setIsSending(true);
    setSendStatus(null);
    
    try {
      // Prepare messages with variables replaced
      const messages = phoneNumbers.map(phone => {
        // Find contact data for this phone
        const contact = contactData.find(c => c.phone === phone) || { phone };
        
        // Replace template variables in message
        let personalizedMessage = messageText;
        
        // Replace {name} with contact name or "there" as fallback
        personalizedMessage = personalizedMessage.replace(
          /{name}/g, 
          contact.name || "there"
        );
        
        // Replace {company} with contact company or "" as fallback
        personalizedMessage = personalizedMessage.replace(
          /{company}/g, 
          contact.company || ""
        );
        
        // Replace {phone} with the recipient's phone
        personalizedMessage = personalizedMessage.replace(
          /{phone}/g, 
          phone
        );
        
        // Replace other common variables
        personalizedMessage = personalizedMessage.replace(
          /{date}/g, 
          new Date().toLocaleDateString()
        );
        
        personalizedMessage = personalizedMessage.replace(
          /{time}/g, 
          new Date().toLocaleTimeString()
        );
        
        return {
          phone,
          message: personalizedMessage
        };
      });

      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages');
      }

      // Count successful and failed messages
      const successful = data.results.filter((r: any) => r.success).length;
      const failed = data.results.length - successful;

      setSendStatus({
        success: true,
        message: `Successfully sent ${successful} message(s)${failed > 0 ? `, ${failed} failed` : ''}`
      });
      
      // Log activity for message sending
      logActivity('send_messages', { 
        recipientCount: messages.length,
        messageLength: messageText.length
      });
      
    } catch (error) {
      console.error('Error sending messages:', error);
      setSendStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send messages'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Voice Dialer Functions
  const handleStartCall = async () => {
    if (isCallActive) return;
    
    setIsCallActive(true);
    
    // Log call activity
    logActivity('start_call', { phoneNumber });
    
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    // For manual calls, skip the actual call and go straight to the results screen
    if (callMode === 'manual') {
      // Still try to look up the contact for manual calls
      try {
        const response = await fetch(`/api/closecrm/search-contact?phoneNumber=${encodeURIComponent(phoneNumber)}`);
        const data = await response.json();
        
        if (response.ok && data.contact) {
          setContactInfo({
            id: data.contact.id,
            name: data.contact.name,
          });
        } else {
          setContactInfo(null);
        }
      } catch (error) {
        console.error('Error searching for contact:', error);
        setContactInfo(null);
      }
      
      setShowCallResults(true);
      return;
    }

    try {
      // First, look up the contact by phone number
      const contactResponse = await fetch(`/api/closecrm/search-contact?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      const contactData = await contactResponse.json();
      
      if (contactResponse.ok && contactData.contact) {
        setContactInfo({
          id: contactData.contact.id,
          name: contactData.contact.name,
        });
      } else {
        setContactInfo(null);
      }
      
      // Make the actual call through Twilio API
      const callResponse = await fetch('/api/twilio/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        }),
      });
      
      const callData = await callResponse.json();
      
      if (!callResponse.ok) {
        throw new Error(callData.error || 'Failed to make call');
      }
      
      console.log('Call initiated with SID:', callData.callSid);
      
    } catch (error) {
      console.error('Error during call:', error);
      alert('There was an error initiating the call. Please try again.');
      setIsCallActive(false);
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setShowCallResults(true);
    
    // Log end call activity
    logActivity('end_call', { phoneNumber });
    
    setPhoneNumber('');
    setCallNotes('');
    setCallOutcome('');
    setContactInfo(null);
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || sendingChatMessage || !selectedConversation) return;
    
    setSendingChatMessage(true);
    
    try {
      const response = await fetch('/api/twilio/conversations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageText: chatMessage,
          toPhoneNumber: selectedConversation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Clear the message input
      setChatMessage('');
      
      // Add the sent message to the conversation with explicit outbound direction
      // This ensures the UI renders the message properly on the right side with orange color
      setConversationMessages(prev => [
        ...prev,
        {
          sid: data.sid,
          body: data.body,
          from: data.from,
          to: data.to,
          direction: 'outbound', // Always outbound for messages we send
          status: data.status,
          dateCreated: data.dateCreated
        }
      ]);
      
      // Wait a second and refresh conversations to show the sent message
      setTimeout(() => {
        if (activeTab === 'sms-chats') {
          fetch('/api/twilio/conversations')
            .then(res => res.json())
            .then(data => {
              if (data.conversations) {
                setConversations(data.conversations);
              }
            })
            .catch(error => console.error('Error refreshing conversations:', error));
        }
      }, 1000);
      
      // Log chat message activity
      logActivity('send_chat', { 
        recipient: selectedConversation,
        messageLength: chatMessage.length
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingChatMessage(false);
    }
  };

  const handleSubmitCallResult = async () => {
    if (!callOutcome) {
      alert('Please select a call outcome');
      return;
    }

    try {
      // Make API call to CloseCRM to log the call
      const response = await fetch('/api/closecrm/log-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          outcome: callOutcome,
          notes: callNotes,
          contactInfo: contactInfo ? {
            id: contactInfo.id,
            name: contactInfo.name,
          } : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log call');
      }
      
      // Reset state
      setShowCallResults(false);
      setPhoneNumber('');
      setCallNotes('');
      setCallOutcome('');
      setContactInfo(null);
      
      alert('Call logged successfully to CloseCRM!');
    } catch (error) {
      console.error('Error logging call:', error);
      alert('Failed to log call. Please try again.');
    }
  };

  // Add a function to handle adding a contact to the pipeline
  const handleAddToPipeline = async () => {
    if (!selectedConversation) return;
    
    setAddingToPipeline(true);
    setPipelineSuccess(null);
    
    try {
      // First search for the contact to get the leadId
      const searchResponse = await fetch(`/api/closecrm/search-contact?phoneNumber=${encodeURIComponent(selectedConversation)}`);
      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok) {
        throw new Error(searchData.error || 'Failed to search for contact');
      }
      
      let leadId = null;
      
      if (searchData.contact) {
        leadId = searchData.contact.leadId;
      } else if (searchData.lead) {
        leadId = searchData.lead.id;
      } else {
        throw new Error('No contact or lead found for this phone number');
      }
      
      // 1. Create a task for the lead
      const addPipelineResponse = await fetch('/api/closecrm/add-to-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: selectedConversation,
          leadId,
          taskText: 'Create Audit and schedule meeting'
        }),
      });
      
      const pipelineData = await addPipelineResponse.json();
      
      if (!addPipelineResponse.ok) {
        throw new Error(pipelineData.error || 'Failed to add contact to pipeline');
      }
      
      // 2. Create a $1900 opportunity for the lead
      const opportunityResponse = await fetch('/api/closecrm/create-opportunity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: selectedConversation,
          leadId
        }),
      });
      
      const opportunityData = await opportunityResponse.json();
      
      if (!opportunityResponse.ok) {
        throw new Error(opportunityData.error || 'Failed to create opportunity');
      }
      
      // Check if we were able to create a task successfully
      const taskAction = pipelineData.results?.actions?.find((action: any) => action.action === 'create_task');
      if (taskAction && taskAction.success && opportunityData.success) {
        setPipelineSuccess('Contact added to pipeline with follow-up task and $1900 opportunity');
      } else if (taskAction && taskAction.success) {
        setPipelineSuccess('Contact added to pipeline with follow-up task');
      } else if (opportunityData.success) {
        setPipelineSuccess('$1900 opportunity created for contact');
      } else {
        setPipelineSuccess('Contact partially added to pipeline - check Close CRM');
      }
      
      // Add a message to the conversation indicating the action was taken
      const taskDetails = taskAction ? `Due: ${taskAction.dueDate}` : '';
      const opportunityDetails = opportunityData.success ? `$1900 opportunity created.` : '';
      const systemMessage = {
        sid: `system_${Date.now()}`,
        body: `✅ Contact was added to pipeline. ${opportunityDetails} A follow-up task was created. ${taskDetails}`,
        from: 'System',
        to: selectedConversation,
        direction: 'outbound',
        status: 'delivered',
        dateCreated: new Date().toISOString()
      };
      
      setConversationMessages(prev => [...prev, systemMessage]);
      
    } catch (error) {
      console.error('Error adding contact to pipeline:', error);
      setPipelineSuccess(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingToPipeline(false);
      
      // Clear success message after 5 seconds
      if (pipelineSuccess && !pipelineSuccess.startsWith('Error')) {
        setTimeout(() => {
          setPipelineSuccess(null);
        }, 5000);
      }
    }
  };

  // Handle searching CRM contacts
  const handleSearchCrmContacts = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCrmContactSearch(e.target.value);
    // Debounce search to avoid too many requests
    setTimeout(() => {
      fetchCrmContacts(1, e.target.value);
    }, 500);
  };
  
  // Reset the form when changing contact source
  const handleContactSourceChange = (source: 'crm' | 'file') => {
    setContactSource(source);
    setPhoneNumbers([]);
    setFileName('');
    setSelectedCrmContacts([]);
  };

  // Drip Campaign Handlers
  const fetchDripCampaigns = async (filter = campaignFilter, search = campaignSearch) => {
    setLoadingDripCampaigns(true);
    try {
      const params = new URLSearchParams({
        status: filter === 'all' ? 'all' : filter,
        limit: '20',
        offset: '0'
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await fetch(`/api/drip-campaign/list?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch drip campaigns');
      }
      
      setDripCampaigns(data.campaigns || []);
      setCampaignSummary(data.summary || null);
    } catch (error) {
      console.error('Error fetching drip campaigns:', error);
    } finally {
      setLoadingDripCampaigns(false);
    }
  };

  const handleManageCampaign = async (campaignId: string, action: 'pause' | 'resume' | 'delete' | 'duplicate', newName?: string) => {
    setManagingCampaign(campaignId);
    try {
      const response = await fetch('/api/drip-campaign/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action, newName })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} campaign`);
      }

      // Refresh campaigns list
      fetchDripCampaigns();
      
      alert(data.message);
    } catch (error) {
      console.error(`Error ${action} campaign:`, error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setManagingCampaign(null);
    }
  };

  const handleBulkCampaignAction = async (action: 'pause' | 'resume', campaignIds: string[]) => {
    if (campaignIds.length === 0) {
      alert('Please select campaigns first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${campaignIds.length} campaign(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      const results = await Promise.all(
        campaignIds.map(id => 
          fetch('/api/drip-campaign/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: id, action })
          })
        )
      );

      const allSuccessful = results.every(r => r.ok);
      
      if (allSuccessful) {
        alert(`Successfully ${action}d ${campaignIds.length} campaign(s)`);
        fetchDripCampaigns();
      } else {
        alert(`Some campaigns failed to ${action}. Please check individual campaigns.`);
        fetchDripCampaigns();
      }
    } catch (error) {
      console.error(`Error bulk ${action}:`, error);
      alert(`Error performing bulk ${action}`);
    }
  };

  const handleCreateDripCampaign = async () => {
    if (!dripCampaignForm.name || dripCampaignForm.selectedContacts.length === 0) {
      alert('Please provide a campaign name and select contacts');
      return;
    }

    setCreatingDripCampaign(true);
    try {
      const response = await fetch('/api/drip-campaign/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dripCampaignForm.name,
          messageTemplates: dripCampaignForm.messageTemplates.filter(t => t.active && t.message.trim()),
          contacts: dripCampaignForm.selectedContacts,
          variables: dripCampaignForm.variables
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create drip campaign');
      }

      // Reset form and refresh campaigns
      setDripCampaignForm({
        name: '',
        messageTemplates: Array(9).fill('').map((_, index) => ({ 
          day: [1, 3, 5, 7, 9, 11, 13, 15, 17][index], 
          message: '', 
          active: true 
        })),
        contactSource: 'file',
        selectedContacts: [],
        variables: ['name', 'company', 'phone', 'email', 'location', 'date', 'time']
      });
      
      fetchDripCampaigns();
      alert('Drip campaign created successfully!');
    } catch (error) {
      console.error('Error creating drip campaign:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingDripCampaign(false);
    }
  };

  const handleDripCampaignContactUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      alert('The file appears to be empty.');
      return;
    }

    // Parse CSV - assuming format: name, company, phone, email, location
    const contacts = lines.slice(1).map((line, index) => {
      const [name, company, phone, email, location, ...rest] = line.split(',').map(item => item.trim());
      
      if (!phone) {
        console.warn(`Row ${index + 2}: No phone number found`);
        return null;
      }

      return {
        name: name || `Contact ${index + 1}`,
        company: company || '',
        phone: phone,
        email: email || '',
        location: location || '',
        ...Object.fromEntries(rest.map((value, i) => [`custom_${i + 1}`, value]))
      };
    }).filter(Boolean);

    setDripCampaignForm(prev => ({
      ...prev,
      selectedContacts: contacts
    }));
  };

  const handleAddToDripPipeline = async (campaignId: string, contactId: string) => {
    try {
      const response = await fetch('/api/drip-campaign/add-to-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, contactId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add contact to pipeline');
      }

      alert('Contact successfully added to pipeline!');
    } catch (error) {
      console.error('Error adding to pipeline:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced drip campaign handlers
  const handleInsertVariableInDripMessage = (templateIndex: number, variable: string) => {
    const newTemplates = [...dripCampaignForm.messageTemplates];
    const currentMessage = newTemplates[templateIndex].message;
    const cursorPosition = 0; // In a real implementation, you'd track cursor position
    
    // Insert variable at cursor position or end of message
    const newMessage = currentMessage + `{${variable}}`;
    newTemplates[templateIndex].message = newMessage;
    
    setDripCampaignForm(prev => ({ ...prev, messageTemplates: newTemplates }));
  };

  const handleSelectDripCrmContacts = async () => {
    if (dripCampaignForm.contactSource === 'crm') {
      // Fetch and allow selection of CRM contacts for drip campaign
      try {
        const response = await fetch('/api/closecrm/list-contacts');
        const data = await response.json();
        
        if (response.ok && data.contacts) {
          // Convert CRM contacts to drip campaign format
          const formattedContacts = data.contacts.map((contact: any) => ({
            name: contact.name,
            company: contact.leadName || '',
            phone: contact.phones[0]?.formattedNumber || '',
            email: contact.emails?.[0]?.email || '',
            location: contact.addresses?.[0]?.address || '',
            leadId: contact.leadId
          })).filter((contact: any) => contact.phone); // Only include contacts with phone numbers
          
          setDripCampaignForm(prev => ({
            ...prev,
            selectedContacts: formattedContacts
          }));
        }
      } catch (error) {
        console.error('Error fetching CRM contacts for drip campaign:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-tech-background text-tech-foreground">
      {/* Notification sound element */}
      <audio ref={notificationSound} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Show loading screen while authenticating */}
      {(!isAuthenticated || loading) ? (
        <LoadingScreen />
      ) : (
        <>
          {/* Sidebar */}
          <div className="w-64 bg-tech-card relative overflow-hidden">
            {/* Tech-inspired decorative elements */}
            <div className="absolute inset-0 bg-grid opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient"></div>
            
            <div className="relative p-4 z-10">
              <h1 className="text-2xl font-bold">
                <span className="text-primary">TRD</span> 
                <span className="text-accent">Dialer</span> & SMS
              </h1>
              <p className="text-sm opacity-75">Communication Platform</p>
            </div>
            
            <nav className="relative mt-8 z-10">
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  activeTab === 'message-editor' 
                    ? 'bg-gradient text-white' 
                    : 'hover:bg-tech-secondary transition-colors duration-200'
                }`}
                onClick={() => setActiveTab('message-editor')}
              >
                <EditIcon />
                <span className="ml-3">Message Editor</span>
              </div>
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  activeTab === 'sms-chats' 
                    ? 'bg-gradient text-white' 
                    : 'hover:bg-tech-secondary transition-colors duration-200'
                }`}
                onClick={() => setActiveTab('sms-chats')}
              >
                <MessageIcon />
                <span className="ml-3">SMS Chats</span>
              </div>
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  activeTab === 'voice-dialer' 
                    ? 'bg-gradient text-white' 
                    : 'hover:bg-tech-secondary transition-colors duration-200'
                }`}
                onClick={() => setActiveTab('voice-dialer')}
              >
                <PhoneIcon />
                <span className="ml-3">Voice Dialer</span>
              </div>
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  activeTab === 'stats' 
                    ? 'bg-gradient text-white' 
                    : 'hover:bg-tech-secondary transition-colors duration-200'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                <StatsIcon />
                <span className="ml-3">Stats</span>
              </div>
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  activeTab === 'ai-rebuttal' 
                    ? 'bg-gradient text-white' 
                    : 'hover:bg-tech-secondary transition-colors duration-200'
                }`}
                onClick={() => setActiveTab('ai-rebuttal')}
              >
                <AIIcon />
                <span className="ml-3">AI Rebuttals</span>
              </div>
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  activeTab === 'drip-campaign' 
                    ? 'bg-gradient text-white' 
                    : 'hover:bg-tech-secondary transition-colors duration-200'
                }`}
                onClick={() => setActiveTab('drip-campaign')}
              >
                <DripCampaignIcon />
                <span className="ml-3">Drip Campaign</span>
              </div>
              {/* User activity logs link - for admin users */}
              <Link href="/admin/activity-logs" 
                className={`flex items-center space-x-2 p-3 rounded transition-colors ${
                  activeTab === 'admin' ? 'bg-tech-accent text-white' : 'hover:bg-tech-elevation-1'
                }`}>
                <ReportsIcon />
                <span>Activity Logs</span>
              </Link>
              {/* Logout button */}
              <button 
                onClick={handleSignOut} 
                className="flex items-center space-x-2 p-3 rounded text-status-danger hover:bg-tech-elevation-1 transition-colors">
                <LogoutIcon />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-tech-background">
            <div className={activeTab === 'message-editor' ? 'block' : 'hidden'}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold">Message Editor</h2>
                  <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-primary flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-slow"></span>
                    Bulk SMS
                  </div>
                </div>
                
                <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                  {/* Top decoration bar */}
                  <div className="h-1 bg-gradient"></div>
                  
                  <div className="p-6">
                    {sendStatus && (
                      <div className={`p-4 mb-6 rounded-md flex items-center ${
                        sendStatus.success 
                          ? 'bg-status-success bg-opacity-20 border border-status-success border-opacity-30 text-status-success' 
                          : 'bg-status-danger bg-opacity-20 border border-status-danger border-opacity-30 text-status-danger'
                      }`}>
                        <div className="mr-3">
                          {sendStatus.success ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>{sendStatus.message}</div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="col-span-1 lg:col-span-2">
                        <div className="bg-tech-secondary bg-opacity-30 p-3 rounded-md mb-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-300">Template Variables</div>
                            <div className="text-xs text-gray-400">Click to insert</div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['name', 'company', 'phone', 'date', 'time', 'link'].map((variable) => (
                              <button 
                                key={variable}
                                className="bg-tech-input border border-tech-border rounded-md px-2 py-1 text-xs text-gray-300 hover:bg-tech-secondary transition-colors duration-200"
                                onClick={() => setMessageText(prev => `${prev}{${variable}}`)}
                              >
                                {`{${variable}}`}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message Template
                        </label>
                        <div className="relative mb-6">
                          <textarea 
                            className="w-full min-h-[180px] p-3 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none scrollbar-thin"
                            placeholder="Enter your message template here... Use {name}, {company}, etc. for personalization."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {messageText.length} / 1600 characters
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Numbers Source
                        </label>
                        <div className="mb-4">
                          <div className="flex bg-tech-secondary bg-opacity-50 rounded-md p-1">
                            <button
                              className={`flex-1 py-2 text-center text-sm rounded-md transition-colors duration-200 ${
                                contactSource === 'file' 
                                  ? 'bg-gradient text-white' 
                                  : 'text-gray-300 hover:bg-tech-secondary'
                              }`}
                              onClick={() => handleContactSourceChange('file')}
                            >
                              Upload File
                            </button>
                            <button
                              className={`flex-1 py-2 text-center text-sm rounded-md transition-colors duration-200 ${
                                contactSource === 'crm' 
                                  ? 'bg-gradient text-white' 
                                  : 'text-gray-300 hover:bg-tech-secondary'
                              }`}
                              onClick={() => handleContactSourceChange('crm')}
                            >
                              Close CRM Contacts
                            </button>
                          </div>
                          <div className="flex items-center mt-1">
                            <button 
                              className="text-xs text-gray-400 hover:text-primary flex items-center"
                              onClick={() => setShowContactFormat(!showContactFormat)}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {showContactFormat ? 'Hide phone format info' : 'Learn about phone number formats'}
                            </button>
                            <a 
                              href="/api/sms/csv-template" 
                              className="text-xs text-gray-400 hover:text-primary ml-4 flex items-center"
                              download
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download CSV Template
                            </a>
                          </div>
                        </div>
                        
                        {showContactFormat && (
                          <div className="bg-tech-secondary bg-opacity-30 p-3 rounded-md mb-4 text-xs text-gray-300">
                            <h4 className="font-medium mb-1">Accepted Phone Number Formats:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>International format with + sign: <span className="text-primary">+14155552671</span></li>
                              <li>10-digit with country code: <span className="text-primary">14155552671</span></li>
                              <li>10-digit US/CA numbers: <span className="text-primary">4155552671</span></li>
                              <li>Numbers with formatting are also supported: <span className="text-primary">(415) 555-2671</span>, <span className="text-primary">415-555-2671</span></li>
                            </ul>
                            <p className="mt-2">All numbers will be normalized before sending. For international numbers outside US/CA, please include the country code with + prefix.</p>
                          </div>
                        )}
                        
                        {contactSource === 'file' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone Numbers (TXT or CSV File)
                            </label>
                            <div className="border-2 border-dashed border-tech-border rounded-md p-6 text-center bg-tech-secondary bg-opacity-20 cursor-pointer hover:bg-tech-secondary hover:bg-opacity-30 transition-colors duration-200"
                              onClick={() => fileInputRef.current?.click()}>
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".txt,.csv"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div className="mt-2 text-sm text-gray-300">
                                {fileName ? fileName : 'Drag & drop or click to upload'}
                              </div>
                              {phoneNumbers.length > 0 && (
                                <div className="mt-2 text-sm text-primary">
                                  Loaded {phoneNumbers.length} phone number(s)
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Close CRM Contacts
                            </label>
                            <div className="mb-4">
                              <div className="relative">
                                <input 
                                  type="text" 
                                  placeholder="Search contacts..." 
                                  className="w-full pl-9 pr-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  value={crmContactSearch}
                                  onChange={handleSearchCrmContacts}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border border-tech-border rounded-md bg-tech-secondary bg-opacity-20 overflow-y-auto max-h-64 scrollbar-thin">
                              {loadingCrmContacts ? (
                                <div className="flex justify-center items-center p-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                              ) : crmContacts.length === 0 ? (
                                <div className="p-4 text-center text-gray-400">
                                  No contacts found. Try refining your search.
                                </div>
                              ) : (
                                <>
                                  <div className="p-2 border-b border-tech-border text-xs text-gray-400 flex justify-between">
                                    <span>Select contacts to message</span>
                                    <span>{selectedCrmContacts.length} selected</span>
                                  </div>
                                  {crmContacts.map(contact => (
                                    <div 
                                      key={contact.id}
                                      className={`p-3 border-b border-tech-border hover:bg-tech-secondary cursor-pointer ${
                                        selectedCrmContacts.some(c => c.id === contact.id) ? 'bg-tech-secondary' : ''
                                      }`}
                                      onClick={() => handleSelectCrmContact(contact)}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="text-sm text-tech-foreground font-medium">{contact.name}</div>
                                          <div className="text-xs text-gray-400">{contact.leadName}</div>
                                        </div>
                                        {selectedCrmContacts.some(c => c.id === contact.id) && (
                                          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {contact.phones.map((phone: any, idx: number) => (
                                          <div key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-tech-secondary">
                                            {phone.formattedNumber}
                                            <span className="ml-1 text-gray-400">({phone.type})</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="p-2 text-center">
                                    <button 
                                      className="text-xs text-primary hover:underline"
                                      onClick={() => fetchCrmContacts(crmContactsPage + 1, crmContactSearch)}
                                    >
                                      Load more contacts
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {selectedCrmContacts.length > 0 && (
                              <div className="mt-2 text-sm text-primary">
                                Selected {selectedCrmContacts.length} contact(s) with {phoneNumbers.length} phone number(s)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Delivery Options
                        </label>
                        <div className="bg-tech-secondary bg-opacity-20 rounded-md p-4">
                          <div className="flex items-center mb-3">
                            <input type="checkbox" id="schedule" className="mr-3 text-primary" />
                            <label htmlFor="schedule" className="text-gray-300 text-sm">Schedule for later</label>
                          </div>
                          <div className="flex mb-3">
                            <div className="w-1/2 pr-2">
                              <input 
                                type="date" 
                                className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                disabled 
                              />
                            </div>
                            <div className="w-1/2 pl-2">
                              <input 
                                type="time" 
                                className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                disabled
                              />
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="confirmation" className="mr-3 text-primary" defaultChecked />
                            <label htmlFor="confirmation" className="text-gray-300 text-sm">Receive delivery reports</label>
                          </div>
                        </div>
                      </div>
            </div>
                    
                    <div className="border-t border-tech-border mt-6 pt-6 flex justify-end">
                      <button 
                        className={`${
                          isSending 
                            ? 'bg-tech-secondary opacity-70 cursor-not-allowed' 
                            : 'bg-gradient hover:shadow-accent'
                        } text-white py-2 px-6 rounded-md flex items-center transition-shadow duration-300`}
                        onClick={handleSendMessages}
                        disabled={isSending}
                      >
                        {isSending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send Messages
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'sms-chats' ? 'block' : 'hidden'}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold">SMS Conversations</h2>
                  <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full flex items-center">
                    <span className={`w-2 h-2 ${loadingConversations ? 'bg-primary animate-pulse-fast' : 'bg-primary animate-pulse-slow'} rounded-full mr-2`}></span>
                    Live Updates
                  </div>
                </div>
                
                <div className="flex h-[calc(100vh-180px)]">
                  {/* Conversation List */}
                  <div className="w-1/3 bg-tech-card rounded-l-lg shadow-tech overflow-y-auto border-r border-tech-border">
                    <div className="p-4 border-b border-tech-border">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Search conversations..." 
                          className="w-full pl-9 pr-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto scrollbar-thin max-h-[calc(100vh-240px)]">
                      {loadingConversations && conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          <p>No conversations found.</p>
                          <p className="text-xs mt-1">Start sending messages to see them here.</p>
                        </div>
                      ) : (
                        conversations.map((conversation) => (
                          <div 
                            key={conversation.phoneNumber} 
                            className={`p-4 border-b border-tech-border hover:bg-tech-secondary hover:bg-opacity-50 cursor-pointer transition-colors duration-200 ${selectedConversation === conversation.phoneNumber ? 'bg-tech-secondary bg-opacity-30' : ''}`}
                            onClick={() => setSelectedConversation(conversation.phoneNumber)}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium text-tech-foreground flex items-center">
                                {conversation.phoneNumber}
                                {conversation.unreadCount > 0 && (
                                  <span className="ml-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(conversation.lastMessageDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 truncate mt-1 flex items-center">
                              {conversation.lastMessageDirection === 'inbound' ? (
                                <svg className="h-3 w-3 mr-1 text-primary transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              ) : (
                                <svg className="h-3 w-3 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              )}
                              {conversation.lastMessageText}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 flex flex-col bg-tech-card rounded-r-lg shadow-tech">
                    {selectedConversation ? (
                      <>
                        <div className="p-4 border-b border-tech-border">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="text-lg font-medium">{selectedConversation}</div>
                              <div className="ml-3 px-2 py-0.5 bg-tech-secondary rounded-full text-xs">
                                {loadingMessages ? 'Loading...' : 'Connected'}
                              </div>
                              {pipelineSuccess && (
                                <div className={`ml-3 px-2 py-0.5 rounded-full text-xs ${pipelineSuccess.startsWith('Error') ? 'bg-status-danger bg-opacity-20 text-status-danger' : 'bg-status-success bg-opacity-20 text-status-success'}`}>
                                  {pipelineSuccess}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className={`p-2 rounded-full transition-colors duration-200 flex items-center ${
                                  addingToPipeline 
                                    ? 'bg-tech-secondary cursor-not-allowed' 
                                    : 'hover:bg-accent hover:bg-opacity-20 text-accent'
                                }`}
                                onClick={handleAddToPipeline}
                                disabled={addingToPipeline}
                                title="Add to Pipeline and create $1900 opportunity"
                              >
                                {addingToPipeline ? (
                                  <svg className="animate-spin h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                )}
                                <span className="ml-1 text-sm">Add to Pipeline</span>
                              </button>
                              <button 
                                className="p-2 hover:bg-tech-secondary hover:bg-opacity-50 rounded-full transition-colors duration-200"
                                onClick={() => {
                                  setPhoneNumber(selectedConversation);
                                  setActiveTab('voice-dialer');
                                }}
                                title="Call this number"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </button>
                              <button className="p-2 hover:bg-tech-secondary hover:bg-opacity-50 rounded-full transition-colors duration-200">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto bg-tech-background bg-grid scrollbar-thin">
                          {loadingMessages ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                          ) : conversationMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <svg className="h-16 w-16 mb-4 text-tech-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              <p>No messages yet.</p>
                              <p className="text-sm mt-1">Send a message to start the conversation.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2 w-full px-2">
                              {/* Group messages by date */}
                              {(() => {
                                let lastDate = '';
                                const messageGroups: React.ReactNode[] = [];
                                
                                conversationMessages.forEach((message, index) => {
                                  const messageDate = new Date(message.dateCreated);
                                  const formattedDate = messageDate.toLocaleDateString();
                                  
                                  // Add date separator if it's a new day
                                  if (formattedDate !== lastDate) {
                                    lastDate = formattedDate;
                                    messageGroups.push(
                                      <div key={`date-${index}`} className="flex justify-center my-4">
                                        <div className="bg-tech-secondary bg-opacity-30 text-gray-400 text-xs py-1 px-3 rounded-full">
                                          {formattedDate === new Date().toLocaleDateString() 
                                            ? 'Today' 
                                            : formattedDate === new Date(Date.now() - 86400000).toLocaleDateString()
                                              ? 'Yesterday'
                                              : formattedDate}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Add the message
                                  const isOutbound = message.direction === 'outbound';
                                  messageGroups.push(
                                    <div key={message.sid} className={`w-full flex mb-3 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`flex max-w-[85%]`}>
                                        {!isOutbound && (
                                          <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 mr-2 self-end flex items-center justify-center">
                                            <span className="text-xs text-white">
                                              {message.from && typeof message.from === 'string' ? message.from.charAt(message.from.length - 1) : '?'}
                                            </span>
                                          </div>
                                        )}
                                        
                                        <div className={`
                                          flex flex-col
                                          ${isOutbound 
                                            ? 'bg-orange-500 text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg' 
                                            : 'bg-blue-500 text-white rounded-tr-lg rounded-tl-sm rounded-bl-lg rounded-br-lg'
                                          } 
                                          p-3 shadow-sm 
                                        `}>
                                          <div className="text-sm whitespace-pre-wrap break-words">{message.body}</div>
                                          <div className={`text-xs ${isOutbound ? 'text-right mt-1 text-orange-200' : 'text-left mt-1 text-blue-100'}`}>
                                            {messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            {isOutbound && (
                                              <span className="ml-2">
                                                {message.status === 'delivered' ? '✓✓' : message.status === 'sent' ? '✓' : '⌛'}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {isOutbound && (
                                          <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 ml-2 self-end flex items-center justify-center">
                                            <span className="text-xs text-white">Me</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                });
                                
                                return messageGroups;
                              })()}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-tech-card p-4 border-t border-tech-border">
                          <div className="flex items-center">
                            <div className="flex-1 relative">
                              <input 
                                type="text" 
                                placeholder="Type a message..." 
                                className="flex-1 w-full px-3 py-2 bg-tech-input border border-tech-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary text-tech-foreground pr-10"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendChatMessage();
                                  }
                                }}
                                disabled={sendingChatMessage}
                              />
                              <div className="absolute right-2 top-2 flex space-x-1">
                                <button className="text-gray-400 hover:text-primary transition-colors duration-200">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                </button>
                                <button className="text-gray-400 hover:text-primary transition-colors duration-200">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <button 
                              className={`${
                                sendingChatMessage ? 'bg-tech-secondary cursor-not-allowed' : 'bg-gradient hover:shadow-accent'
                              } text-white px-4 py-2 rounded-r-md transition-shadow duration-300 flex items-center`}
                              onClick={handleSendChatMessage}
                              disabled={sendingChatMessage}
                            >
                              {sendingChatMessage ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : null}
                              Send
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <svg className="h-20 w-20 mb-6 text-tech-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-xl font-medium mb-2">Select a Conversation</h3>
                        <p className="text-center max-w-md">
                          Choose a conversation from the list to view and send messages.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'voice-dialer' ? 'block' : 'hidden'}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold">Voice Dialer</h2>
                  <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-accent flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse-slow"></span>
                    EspoCRM Connected
                  </div>
                  <button 
                    onClick={() => setShowAudioSettings(!showAudioSettings)}
                    className="ml-auto bg-tech-secondary hover:bg-tech-border px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                    Audio Settings
                  </button>
                </div>
                
                {/* Audio Settings Panel */}
                {showAudioSettings && (
                  <div className="bg-tech-card rounded-lg shadow-tech mb-6 overflow-hidden">
                    <div className="h-1 bg-gradient-accent"></div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Audio Device Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Microphone (Input)
                          </label>
                          <select
                            className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                            value={audioInput}
                            onChange={(e) => setAudioInput(e.target.value)}
                          >
                            <option value="default">Use Computer Default</option>
                            {audioDevices.inputs.map((device) => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Speakers (Output)
                          </label>
                          <select
                            className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                            value={audioOutput}
                            onChange={(e) => setAudioOutput(e.target.value)}
                          >
                            <option value="default">Use Computer Default</option>
                            {audioDevices.outputs.map((device) => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-400">
                        <p>Note: These settings will be used when making calls through the Twilio integration.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!showCallResults ? (
                  <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                    {/* Top decoration bar */}
                    <div className="h-1 bg-gradient"></div>
                    
                    {!isCallActive ? (
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="w-10 h-10 rounded-lg bg-gradient flex items-center justify-center text-white mr-3">
                            <PhoneIcon />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">New Outbound Call</h3>
                            <p className="text-gray-400 text-sm">Contact leads via Twilio's Voice API</p>
                          </div>
                        </div>
                        
                        {/* Call Mode Selection */}
                        <div className="mb-6">
                          <div className="flex bg-tech-secondary bg-opacity-50 rounded-md p-1">
                            <button
                              className={`flex-1 py-2 text-center text-sm rounded-md transition-colors duration-200 ${
                                callMode === 'twilio' 
                                  ? 'bg-gradient text-white' 
                                  : 'text-gray-300 hover:bg-tech-secondary'
                              }`}
                              onClick={() => setCallMode('twilio')}
                            >
                              Twilio Call
                            </button>
                            <button
                              className={`flex-1 py-2 text-center text-sm rounded-md transition-colors duration-200 ${
                                callMode === 'manual' 
                                  ? 'bg-gradient text-white' 
                                  : 'text-gray-300 hover:bg-tech-secondary'
                              }`}
                              onClick={() => setCallMode('manual')}
                            >
                              Manual Call
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-400 text-center">
                            {callMode === 'twilio' 
                              ? 'Make a call through the Twilio platform' 
                              : 'Log details for a call made from your personal phone'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <input 
                                type="tel" 
                                className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-tech-foreground"
                                placeholder="+1 (555) 123-4567"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                              <div className="absolute right-3 top-2 text-gray-400 text-xs">
                                Try ending with 1234, 5678, 9999
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Pre-Call Notes
                            </label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-tech-foreground"
                              placeholder="Enter call notes..."
                              value={callNotes}
                              onChange={(e) => setCallNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="border-t border-tech-border pt-4 flex justify-center">
                          <button 
                            onClick={handleStartCall}
                            className="bg-gradient text-white py-3 px-6 rounded-md hover:shadow-accent transition-shadow duration-300 flex items-center"
                          >
                            <PhoneIcon />
                            <span className="ml-2">
                              {callMode === 'twilio' ? 'Start Call' : 'Log Manual Call'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="inline-block p-10 rounded-full bg-tech-secondary mb-6 relative">
                          <div className="absolute inset-4 rounded-full border-2 border-accent opacity-60 animate-ping"></div>
                          <div className="text-5xl text-primary">
                            <PhoneIcon />
                          </div>
                        </div>
                        
                        <div className="mb-8">
                          <div className="text-xl font-semibold mb-2">Call in Progress</div>
                          <div className="text-2xl text-primary mb-4">{phoneNumber}</div>
                          
                          {contactInfo ? (
                            <div className="tech-border inline-block p-4 mb-4 bg-tech-secondary bg-opacity-50">
                              <div className="text-lg text-tech-foreground">{contactInfo.name}</div>
                              <div className="text-sm text-gray-400">Contact ID: {contactInfo.id}</div>
                              <div className="bg-status-success bg-opacity-20 text-status-success rounded px-2 py-1 text-xs mt-2 inline-block">
                                CRM Match Found
                              </div>
                            </div>
                          ) : (
                            <div className="tech-border inline-block p-4 mb-4 bg-tech-secondary bg-opacity-50">
                              <div className="text-lg text-tech-foreground">Unknown Contact</div>
                              <div className="text-sm text-gray-400">No matching CRM record</div>
                              <div className="bg-status-warning bg-opacity-20 text-status-warning rounded px-2 py-1 text-xs mt-2 inline-block">
                                No CRM Match
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                          <button 
                            onClick={handleEndCall}
                            className="bg-status-danger text-white py-3 px-6 rounded-md hover:shadow-tech transition-shadow duration-300 flex items-center"
                          >
                            <span>End Call</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-tech-card rounded-lg shadow-tech">
                    {/* Top decoration bar */}
                    <div className="h-1 bg-gradient"></div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-6 text-primary flex items-center">
                        <span className="w-8 h-8 rounded bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                          <span className="text-primary text-sm">✓</span>
                        </span>
                        {callMode === 'twilio' ? 'Call Report' : 'Manual Call Report'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-tech-secondary bg-opacity-30 p-4 rounded-md">
                          <div className="mb-1 text-gray-400 text-sm">Phone Number</div>
                          <div className="text-lg text-tech-foreground">{phoneNumber}</div>
                        </div>
                        
                        {contactInfo && (
                          <div className="bg-tech-secondary bg-opacity-30 p-4 rounded-md">
                            <div className="mb-1 text-gray-400 text-sm">Contact</div>
                            <div className="text-lg text-tech-foreground">{contactInfo.name}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Call Outcome
                        </label>
                        <select
                          className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          value={callOutcome}
                          onChange={(e) => setCallOutcome(e.target.value)}
                        >
                          <option value="">Select an outcome</option>
                          {callOutcomes.map((outcome) => (
                            <option key={outcome} value={outcome}>
                              {outcome}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Call Notes
                        </label>
                        <textarea
                          className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground h-32 focus:outline-none focus:ring-1 focus:ring-primary scrollbar-thin"
                          placeholder="Enter detailed notes about the call..."
                          value={callNotes}
                          onChange={(e) => setCallNotes(e.target.value)}
                        />
                      </div>
                      
                      <div className="border-t border-tech-border pt-4 flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowCallResults(false);
                            setIsCallActive(false);
                          }}
                          className="px-4 py-2 border border-tech-border rounded-md text-gray-300 hover:bg-tech-secondary hover:bg-opacity-50 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitCallResult}
                          className="px-4 py-2 bg-gradient text-white rounded-md hover:shadow-accent transition-shadow duration-300"
                        >
                          Submit to CRM
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={activeTab === 'stats' ? 'block' : 'hidden'}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold">Campaign Stats</h2>
                  <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-primary flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-slow"></span>
                    Twilio Analytics
                  </div>
                  
                  {/* Period selector */}
                  <div className="ml-auto flex bg-tech-secondary bg-opacity-50 rounded-md p-1">
                    {['24h', '7d', '30d', 'all'].map((period) => (
                      <button
                        key={period}
                        className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                          statsPeriod === period 
                            ? 'bg-gradient text-white' 
                            : 'text-gray-300 hover:bg-tech-secondary'
                        }`}
                        onClick={() => setStatsPeriod(period as any)}
                      >
                        {period === '24h' ? 'Last 24h' : 
                         period === '7d' ? 'Last 7 Days' : 
                         period === '30d' ? 'Last 30 Days' : 
                         'All Time'}
                      </button>
                    ))}
                  </div>
                </div>
                
                {statsLoading ? (
                  <div className="flex items-center justify-center h-64 bg-tech-card rounded-lg shadow-tech">
                    <div className="text-center">
                      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <h3 className="text-lg font-medium text-tech-foreground">Loading statistics...</h3>
                    </div>
                  </div>
                ) : statsError ? (
                  <div className="bg-status-danger bg-opacity-20 border border-status-danger text-status-danger p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Error Loading Stats</h3>
                    <p>{statsError}</p>
                  </div>
                ) : statsData ? (
                  <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                        <div className="h-1 bg-gradient"></div>
                        <div className="p-4">
                          <div className="text-sm text-gray-400 mb-1">Total Messages</div>
                          <div className="text-3xl font-bold text-primary">{statsData.overview.totalMessages}</div>
                          <div className="mt-2 text-xs text-gray-500">
                            {statsData.timeRange.start} to {statsData.timeRange.end}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                        <div className="h-1 bg-gradient"></div>
                        <div className="p-4">
                          <div className="text-sm text-gray-400 mb-1">Delivery Rate</div>
                          <div className="text-3xl font-bold text-primary">{statsData.overview.deliveryRate}%</div>
                          <div className="mt-2 text-xs flex justify-between text-gray-500">
                            <span>Delivered: {statsData.overview.deliveredCount}</span>
                            <span>Failed: {statsData.overview.totalMessages - statsData.overview.deliveredCount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                        <div className="h-1 bg-gradient-accent"></div>
                        <div className="p-4">
                          <div className="text-sm text-gray-400 mb-1">Direction</div>
                          <div className="flex items-end">
                            <div className="text-3xl font-bold text-accent mr-2">{statsData.overview.outbound}</div>
                            <div className="text-sm text-gray-400">outbound</div>
                          </div>
                          <div className="flex items-end mt-1">
                            <div className="text-lg font-bold text-gray-300 mr-2">{statsData.overview.inbound}</div>
                            <div className="text-xs text-gray-400">inbound</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                        <div className="h-1 bg-gradient-accent"></div>
                        <div className="p-4">
                          <div className="text-sm text-gray-400 mb-1">Total Cost</div>
                          <div className="text-3xl font-bold text-accent">${statsData.overview.totalCost}</div>
                          <div className="mt-2 text-xs text-gray-500">
                            {statsData.overview.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Breakdown */}
                    <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">Message Status Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(statsData.statusBreakdown).map(([status, count]: [string, any]) => (
                            <div key={status} className="border border-tech-border rounded-md p-3">
                              <div className="text-sm font-medium mb-1 flex justify-between">
                                <span>{status}</span>
                                <span className={
                                  status === 'delivered' ? 'text-status-success' : 
                                  status === 'failed' || status === 'undelivered' ? 'text-status-danger' : 
                                  'text-gray-400'
                                }>
                                  {count}
                                </span>
                              </div>
                              <div className="w-full bg-tech-secondary bg-opacity-50 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    status === 'delivered' ? 'bg-status-success' : 
                                    status === 'failed' || status === 'undelivered' ? 'bg-status-danger' : 
                                    'bg-primary'
                                  }`}
                                  style={{ width: `${(count / statsData.overview.totalMessages) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Top Recipients */}
                    <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">Top Recipients</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-tech-secondary bg-opacity-30">
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Phone Number</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Total Messages</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Delivered</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Failed</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Delivery Rate</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {statsData.topPhoneNumbers.map((phoneData: any, index: number) => (
                                <tr key={index} className="border-b border-tech-border">
                                  <td className="px-4 py-3">{phoneData.phoneNumber}</td>
                                  <td className="px-4 py-3">{phoneData.totalMessages}</td>
                                  <td className="px-4 py-3 text-status-success">{phoneData.delivered}</td>
                                  <td className="px-4 py-3 text-status-danger">{phoneData.failed}</td>
                                  <td className="px-4 py-3">{phoneData.deliveryRate.toFixed(1)}%</td>
                                  <td className="px-4 py-3">${phoneData.cost}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Messages */}
                    <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">Recent Messages</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-tech-secondary bg-opacity-30">
                                <th className="px-4 py-2 text-left text-xs text-gray-400">To</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">From</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Message</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Status</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Date</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-400">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {statsData.recentMessages.map((message: any, index: number) => (
                                <tr key={index} className="border-b border-tech-border">
                                  <td className="px-4 py-3 text-sm">{message.to}</td>
                                  <td className="px-4 py-3 text-sm">{message.from}</td>
                                  <td className="px-4 py-3 text-sm max-w-xs truncate">{message.body}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      message.status === 'delivered' ? 'bg-status-success bg-opacity-20 text-status-success' : 
                                      message.status === 'failed' || message.status === 'undelivered' ? 'bg-status-danger bg-opacity-20 text-status-danger' : 
                                      'bg-primary bg-opacity-20 text-primary'
                                    }`}>
                                      {message.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm">{new Date(message.dateSent).toLocaleString()}</td>
                                  <td className="px-4 py-3 text-sm">{message.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-tech-secondary bg-opacity-20 border border-tech-border p-8 text-center rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No SMS Stats Available</h3>
                    <p className="text-gray-400">Waiting for Twilio API keys to be configured</p>
                  </div>
                )}
              </div>
            </div>

            <div className={activeTab === 'ai-rebuttal' ? 'block' : 'hidden'}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold">AI Rebuttal Generator</h2>
                  <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-accent flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse-slow"></span>
                    Powered by AI
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Input Section */}
                  <div className="col-span-1 bg-tech-card rounded-lg shadow-tech overflow-hidden">
                    <div className="h-1 bg-gradient"></div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-3">Customer Objection</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Enter a brief description of the objection or hurdle you're facing on the call
                      </p>
                      
                      {/* Common objections quick select */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-300 mb-2">Common Objections:</div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Busy right now",
                            "Already working with agent",
                            "Need to think about it",
                            "Price too high",
                            "Just looking for info",
                            "Bad timing",
                            "Need spouse approval",
                            "Concerned about market"
                          ].map((objection) => (
                            <button
                              key={objection}
                              className="px-2 py-1 bg-tech-secondary bg-opacity-40 hover:bg-tech-secondary rounded-md text-xs text-gray-300 transition-colors duration-200"
                              onClick={() => setRebuttalInput(objection)}
                            >
                              {objection}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <textarea
                        className="w-full h-32 bg-tech-input border border-tech-border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-accent mb-4 text-tech-foreground"
                        placeholder="e.g., 'Client says they're just looking for information and not ready to commit'"
                        value={rebuttalInput}
                        onChange={(e) => setRebuttalInput(e.target.value)}
                      />
                      
                      {rebuttalError && (
                        <div className="bg-status-danger bg-opacity-20 border border-status-danger text-status-danger p-3 rounded-md mb-4">
                          {rebuttalError}
                        </div>
                      )}
                      
                      <button
                        className={`w-full py-3 px-4 rounded-md flex items-center justify-center ${
                          isGeneratingRebuttal
                            ? 'bg-tech-secondary cursor-not-allowed'
                            : 'bg-gradient hover:shadow-accent'
                        } transition-shadow duration-300 text-white`}
                        onClick={handleGenerateRebuttal}
                        disabled={isGeneratingRebuttal}
                      >
                        {isGeneratingRebuttal ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <AIIcon />
                            <span className="ml-2">Generate Rebuttal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Response Section */}
                  <div className="col-span-1 lg:col-span-2 bg-tech-card rounded-lg shadow-tech overflow-hidden">
                    <div className="h-1 bg-gradient-accent"></div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-3">Suggested Response</h3>
                      
                      {rebuttalResponse ? (
                        <div className="bg-tech-secondary bg-opacity-30 p-4 rounded-lg border border-tech-border mb-4">
                          <div className="text-lg text-tech-foreground leading-relaxed">
                            {rebuttalResponse}
                          </div>
                          <div className="flex justify-end mt-3">
                            <button
                              className="text-xs px-3 py-1 bg-tech-secondary hover:bg-tech-border rounded-md text-gray-300 flex items-center transition-colors duration-200"
                              onClick={() => {
                                // Copy to clipboard - guard against SSR
                                if (typeof window !== 'undefined' && navigator.clipboard) {
                                  navigator.clipboard.writeText(rebuttalResponse);
                                }
                              }}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8z"></path>
                              </svg>
                              Copy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-tech-secondary bg-opacity-20 border border-tech-border p-6 rounded-lg text-center">
                          <div className="text-gray-400 mb-2">No rebuttal generated yet</div>
                          <div className="text-sm text-gray-500">Enter an objection and click "Generate Rebuttal"</div>
                        </div>
                      )}
                      
                      {/* Recent rebuttals */}
                      {recentRebuttals.length > 0 && (
                        <>
                          <h4 className="text-md font-medium mb-3 mt-6">Recent Rebuttals</h4>
                          <div className="space-y-3">
                            {recentRebuttals.map((item, index) => (
                              <div key={index} className="border-b border-tech-border pb-3">
                                <div className="flex justify-between">
                                  <div className="text-sm font-medium text-primary">{item.input}</div>
                                  <button
                                    className="text-xs px-2 py-1 bg-tech-secondary hover:bg-tech-border rounded-md text-gray-400 transition-colors duration-200"
                                    onClick={() => {
                                      setRebuttalInput(item.input);
                                      setRebuttalResponse(item.response);
                                    }}
                                  >
                                    Reuse
                                  </button>
                                </div>
                                <div className="text-sm text-gray-300 mt-1 line-clamp-2">{item.response}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Information about the feature */}
                <div className="mt-6 bg-tech-secondary bg-opacity-20 border border-tech-border rounded-lg p-4 text-sm text-gray-400">
                  <p>
                    <span className="font-medium text-accent">Pro Tip:</span> This feature is designed for use during live calls.
                    When a prospect raises an objection, quickly add it here to get an AI-generated rebuttal that you can use to overcome the hurdle.
                  </p>
                </div>
              </div>
            </div>

            <div className={activeTab === 'drip-campaign' ? 'block' : 'hidden'}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold">Drip Campaign</h2>
                  <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-primary flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-slow"></span>
                    9-Touch Automation
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Campaign Creation Form */}
                  <div className="xl:col-span-2 bg-tech-card rounded-lg shadow-tech overflow-hidden">
                    <div className="h-1 bg-gradient"></div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-4">Create New Campaign</h3>
                      
                      {/* Campaign Name */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Campaign Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="e.g., Real Estate Follow-up Q1 2024"
                          value={dripCampaignForm.name}
                          onChange={(e) => setDripCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      {/* Contact Source Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Contact Source
                        </label>
                        <div className="flex bg-tech-secondary bg-opacity-50 rounded-md p-1">
                          <button
                            className={`flex-1 py-2 text-center text-sm rounded-md transition-colors duration-200 ${
                              dripCampaignForm.contactSource === 'file' 
                                ? 'bg-gradient text-white' 
                                : 'text-gray-300 hover:bg-tech-secondary'
                            }`}
                            onClick={() => setDripCampaignForm(prev => ({ ...prev, contactSource: 'file' }))}
                          >
                            Upload CSV File
                          </button>
                          <button
                            className={`flex-1 py-2 text-center text-sm rounded-md transition-colors duration-200 ${
                              dripCampaignForm.contactSource === 'crm' 
                                ? 'bg-gradient text-white' 
                                : 'text-gray-300 hover:bg-tech-secondary'
                            }`}
                            onClick={() => setDripCampaignForm(prev => ({ ...prev, contactSource: 'crm' }))}
                          >
                            Close CRM Contacts
                          </button>
                        </div>
                      </div>

                      {/* Contact Upload/Selection */}
                      {dripCampaignForm.contactSource === 'file' ? (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Upload Contacts (CSV)
                          </label>
                          <div className="border-2 border-dashed border-tech-border rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept=".csv"
                              className="hidden"
                              id="drip-csv-upload"
                              onChange={handleDripCampaignContactUpload}
                            />
                            <label htmlFor="drip-csv-upload" className="cursor-pointer">
                              <div className="text-gray-300 mb-2">
                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                              </div>
                              <div className="text-sm text-gray-300">Click to upload CSV file</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Format: name, company, phone, email, location
                              </div>
                            </label>
                          </div>
                          
                          {dripCampaignForm.selectedContacts.length > 0 && (
                            <div className="mt-3 text-sm text-green-400">
                              ✓ {dripCampaignForm.selectedContacts.length} contacts loaded
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select CRM Contacts
                          </label>
                          <div className="bg-tech-secondary bg-opacity-20 border border-tech-border rounded-md p-4">
                            <div className="text-sm text-gray-400 mb-2">
                              Search and select contacts from your Close CRM
                            </div>
                            <input
                              type="text"
                              className="w-full p-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                              placeholder="Search contacts..."
                              // Add CRM search functionality here
                            />
                          </div>
                        </div>
                      )}

                      {/* Available Variables */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Available Variables
                        </label>
                        <div className="bg-tech-secondary bg-opacity-30 p-3 rounded-md">
                          <div className="flex flex-wrap gap-2">
                            {dripCampaignForm.variables.map((variable) => (
                              <span 
                                key={variable}
                                className="bg-tech-input border border-tech-border rounded-md px-2 py-1 text-xs text-gray-300"
                              >
                                {`{${variable}}`}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Click any variable above to use in your messages
                          </div>
                        </div>
                      </div>

                      {/* Message Templates */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-300 mb-3">Message Templates (9-Touch Sequence)</h4>
                        <div className="space-y-4">
                          {dripCampaignForm.messageTemplates.map((template, index) => (
                            <div key={index} className="border border-tech-border rounded-md p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-primary">
                                    Day {template.day} Message
                                  </span>
                                  <div className="ml-2 text-xs text-gray-400">
                                    ({index === 0 ? 'Initial' : 'Follow-up'})
                                  </div>
                                </div>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={template.active}
                                    onChange={(e) => {
                                      const newTemplates = [...dripCampaignForm.messageTemplates];
                                      newTemplates[index].active = e.target.checked;
                                      setDripCampaignForm(prev => ({ ...prev, messageTemplates: newTemplates }));
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-xs text-gray-400">Active</span>
                                </label>
                              </div>
                              <textarea
                                className="w-full h-24 bg-tech-input border border-tech-border rounded-md p-3 text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                placeholder={`Enter your message for day ${template.day}... Use {name}, {company}, etc. for personalization.`}
                                value={template.message}
                                onChange={(e) => {
                                  const newTemplates = [...dripCampaignForm.messageTemplates];
                                  newTemplates[index].message = e.target.value;
                                  setDripCampaignForm(prev => ({ ...prev, messageTemplates: newTemplates }));
                                }}
                                disabled={!template.active}
                              />
                              <div className="text-xs text-gray-400 mt-1">
                                {template.message.length} / 1600 characters
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Create Campaign Button */}
                      <button
                        onClick={handleCreateDripCampaign}
                        disabled={creatingDripCampaign}
                        className={`w-full py-3 px-4 rounded-md flex items-center justify-center ${
                          creatingDripCampaign
                            ? 'bg-tech-secondary cursor-not-allowed'
                            : 'bg-gradient hover:shadow-primary'
                        } transition-shadow duration-300 text-white`}
                      >
                        {creatingDripCampaign ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  {/* Create Campaign Button */}
                  <button
                    onClick={handleCreateDripCampaign}
                    disabled={creatingDripCampaign}
                    className={`w-full py-3 px-4 rounded-md flex items-center justify-center ${
                      creatingDripCampaign
                        ? 'bg-tech-secondary cursor-not-allowed'
                        : 'bg-gradient hover:shadow-primary'
                    } transition-shadow duration-300 text-white`}
                  >
                    {creatingDripCampaign ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <DripCampaignIcon />
                        <span className="ml-2">Create Drip Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Campaign List and Stats */}
              <div className="xl:col-span-1 space-y-6">
                {/* Campaign Summary */}
                {campaignSummary && (
                  <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                    <div className="h-1 bg-gradient"></div>
                    <div className="p-6">
                      <h4 className="text-md font-medium text-gray-300 mb-4">Campaign Overview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{campaignSummary.activeCampaigns}</div>
                          <div className="text-gray-400">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">{campaignSummary.totalCampaigns}</div>
                          <div className="text-gray-400">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-tech-foreground">{campaignSummary.totalContacts}</div>
                          <div className="text-gray-400">Contacts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-status-success">{campaignSummary.overallReplyRate}%</div>
                          <div className="text-gray-400">Reply Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campaign Filters and Search */}
                <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                  <div className="h-1 bg-gradient-accent"></div>
                  <div className="p-6">
                    <h4 className="text-md font-medium text-gray-300 mb-4">Campaign Management</h4>
                    
                    {/* Status Filter */}
                    <div className="mb-4">
                      <div className="flex bg-tech-secondary bg-opacity-50 rounded-md p-1 text-xs">
                        {(['all', 'active', 'paused', 'completed'] as const).map((status) => (
                          <button
                            key={status}
                            className={`flex-1 py-1.5 text-center rounded-md transition-colors duration-200 capitalize ${
                              campaignFilter === status 
                                ? 'bg-gradient text-white' 
                                : 'text-gray-300 hover:bg-tech-secondary'
                            }`}
                            onClick={() => setCampaignFilter(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search campaigns..."
                          className="w-full pl-8 pr-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                          value={campaignSearch}
                          onChange={(e) => setCampaignSearch(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 py-2 px-2 bg-tech-secondary hover:bg-tech-border rounded-md text-xs text-gray-300 transition-colors duration-200"
                        onClick={() => {
                          const activeCampaigns = dripCampaigns.filter(c => c.status === 'active').map(c => c.id);
                          handleBulkCampaignAction('pause', activeCampaigns);
                        }}
                      >
                        ⏸️ Pause All
                      </button>
                      <button 
                        className="flex-1 py-2 px-2 bg-tech-secondary hover:bg-tech-border rounded-md text-xs text-gray-300 transition-colors duration-200"
                        onClick={() => {
                          const pausedCampaigns = dripCampaigns.filter(c => c.status === 'paused').map(c => c.id);
                          handleBulkCampaignAction('resume', pausedCampaigns);
                        }}
                      >
                        ▶️ Resume All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Campaigns */}
                <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                  <div className="h-1 bg-gradient-accent"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-300">
                        {campaignFilter === 'all' ? 'All Campaigns' : 
                         campaignFilter === 'active' ? 'Active Campaigns' :
                         campaignFilter === 'paused' ? 'Paused Campaigns' :
                         'Completed Campaigns'} ({dripCampaigns.length})
                      </h4>
                      {loadingDripCampaigns && (
                        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>
                    
                    {dripCampaigns.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                        {dripCampaigns.map((campaign) => (
                          <div 
                            key={campaign.id} 
                            className={`p-3 rounded-md border cursor-pointer transition-colors duration-200 ${
                              selectedDripCampaign === campaign.id 
                                ? 'border-primary bg-primary bg-opacity-10' 
                                : 'border-tech-border hover:border-tech-secondary'
                            }`}
                            onClick={() => setSelectedDripCampaign(campaign.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm text-tech-foreground truncate">
                                {campaign.name}
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  campaign.status === 'active' ? 'bg-status-success bg-opacity-20 text-status-success' : 
                                  campaign.status === 'paused' ? 'bg-status-warning bg-opacity-20 text-status-warning' : 
                                  campaign.status === 'completed' ? 'bg-primary bg-opacity-20 text-primary' :
                                  'bg-tech-secondary text-gray-400'
                                }`}>
                                  {campaign.status}
                                </div>
                                
                                {/* Campaign Actions Dropdown */}
                                <div className="relative">
                                  <button 
                                    className="p-1 hover:bg-tech-secondary rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Toggle dropdown - simple implementation
                                      const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (dropdown) {
                                        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                                      }
                                    }}
                                  >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>
                                  <div 
                                    className="absolute right-0 mt-1 bg-tech-card border border-tech-border rounded-md shadow-lg z-10 min-w-32"
                                    style={{ display: 'none' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {campaign.status === 'active' && (
                                      <button 
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-tech-secondary"
                                        onClick={() => handleManageCampaign(campaign.id, 'pause')}
                                        disabled={managingCampaign === campaign.id}
                                      >
                                        ⏸️ Pause
                                      </button>
                                    )}
                                    {campaign.status === 'paused' && (
                                      <button 
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-tech-secondary"
                                        onClick={() => handleManageCampaign(campaign.id, 'resume')}
                                        disabled={managingCampaign === campaign.id}
                                      >
                                        ▶️ Resume
                                      </button>
                                    )}
                                    <button 
                                      className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-tech-secondary"
                                      onClick={() => {
                                        const newName = prompt('Enter name for duplicated campaign:', `Copy of ${campaign.name}`);
                                        if (newName) handleManageCampaign(campaign.id, 'duplicate', newName);
                                      }}
                                      disabled={managingCampaign === campaign.id}
                                    >
                                      📋 Duplicate
                                    </button>
                                    <button 
                                      className="block w-full text-left px-3 py-2 text-sm text-status-danger hover:bg-tech-secondary"
                                      onClick={() => {
                                        if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                                          handleManageCampaign(campaign.id, 'delete');
                                        }
                                      }}
                                      disabled={managingCampaign === campaign.id}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div className="flex justify-between">
                                <span>Contacts: {campaign.totalContacts || 0}</span>
                                <span>Sent: {campaign.sentMessages || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Replied: {campaign.replies || 0}</span>
                                <span>Progress: {campaign.completionRate || 0}%</span>
                              </div>
                              {campaign.nextScheduledMessage && (
                                <div className="text-primary text-xs">
                                  Next: {new Date(campaign.nextScheduledMessage).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm">
                        {loadingDripCampaigns ? 'Loading campaigns...' : 
                         campaignSearch ? 'No campaigns match your search' :
                         campaignFilter === 'active' ? 'No active campaigns' :
                         campaignFilter === 'paused' ? 'No paused campaigns' :
                         campaignFilter === 'completed' ? 'No completed campaigns' :
                         'No campaigns yet'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign Stats */}
                {selectedDripCampaign && (
                  <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                    <div className="h-1 bg-gradient"></div>
                    <div className="p-6">
                      <h4 className="text-md font-medium text-gray-300 mb-4">Campaign Details</h4>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Total Contacts:</span>
                          <span className="text-sm font-medium">156</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Messages Sent:</span>
                          <span className="text-sm font-medium">342</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Delivery Rate:</span>
                          <span className="text-sm font-medium text-status-success">98.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Reply Rate:</span>
                          <span className="text-sm font-medium text-accent">12.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Pipeline Adds:</span>
                          <span className="text-sm font-medium text-primary">8</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-tech-border">
                        <button 
                          className="w-full py-2 px-3 bg-tech-secondary hover:bg-tech-border rounded-md text-sm text-gray-300 transition-colors duration-200"
                          onClick={() => {
                            // Add functionality to view campaign details
                          }}
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
                  <div className="h-1 bg-gradient-accent"></div>
                  <div className="p-6">
                    <h4 className="text-md font-medium text-gray-300 mb-4">Quick Actions</h4>
                    
                    <div className="space-y-2">
                      <button className="w-full py-2 px-3 bg-tech-secondary hover:bg-tech-border rounded-md text-sm text-gray-300 transition-colors duration-200 text-left">
                        📊 View All Campaign Stats
                      </button>
                      <button className="w-full py-2 px-3 bg-tech-secondary hover:bg-tech-border rounded-md text-sm text-gray-300 transition-colors duration-200 text-left">
                        📋 Export Contact Replies
                      </button>
                      <button className="w-full py-2 px-3 bg-tech-secondary hover:bg-tech-border rounded-md text-sm text-gray-300 transition-colors duration-200 text-left">
                        🎯 Add Responders to Pipeline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information about drip campaigns */}
            <div className="mt-6 bg-tech-secondary bg-opacity-20 border border-tech-border rounded-lg p-4 text-sm text-gray-400">
              <p>
                <span className="font-medium text-primary">Drip Campaign Info:</span> The 9-touch sequence sends messages on days 1, 3, 5, 7, 9, 11, 13, 15, and 17. 
                The system automatically tracks replies and removes responders from subsequent messages. 
                Non-responders can be easily added to your pipeline for direct follow-up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamically import the dashboard with SSR disabled to prevent hydration issues
const Dashboard = dynamic(() => Promise.resolve(DashboardContent), {
  ssr: false,
  loading: () => <LoadingScreen />
});

export default Dashboard;
