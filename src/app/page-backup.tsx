'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { useActivityLogger } from './hooks/useActivityLogger';
import ErrorBoundary from './components/ErrorBoundary';
import { TabComponent } from './components/TabComponent';
import { SMSChatsTab } from './components/SMSChatsTab';
import { VoiceDialerTab } from './components/VoiceDialerTab';

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
  
  // Authentication state - always call hooks in same order
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('message-editor');
  const [mounted, setMounted] = useState(false);
  
  // Message Editor state - always initialize these hooks
  const [messageText, setMessageText] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Contact management state - always initialize
  const [contactSource, setContactSource] = useState<'crm' | 'file'>('file');
  const [crmContacts, setCrmContacts] = useState<any[]>([]);
  const [selectedCrmContacts, setSelectedCrmContacts] = useState<any[]>([]);
  const [loadingCrmContacts, setLoadingCrmContacts] = useState(false);
  const [crmContactSearch, setCrmContactSearch] = useState('');
  const [crmContactsPage, setCrmContactsPage] = useState(1);
  const [showContactFormat, setShowContactFormat] = useState(false);
  const [contactData, setContactData] = useState<Array<{
    phone: string,
    name?: string,
    company?: string,
    email?: string,
    [key: string]: any
  }>>([]);
  
  // Stats state - always initialize
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  
  // AI Rebuttal Generator state - always initialize
  const [rebuttalInput, setRebuttalInput] = useState('');
  const [rebuttalResponse, setRebuttalResponse] = useState<string | null>(null);
  const [isGeneratingRebuttal, setIsGeneratingRebuttal] = useState(false);
  const [rebuttalError, setRebuttalError] = useState<string | null>(null);
  const [recentRebuttals, setRecentRebuttals] = useState<Array<{input: string, response: string}>>([]);
  
  // Pipeline state - always initialize
  const [addingToPipeline, setAddingToPipeline] = useState(false);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);
  
  // Drip Campaign state - always initialize
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
  
  // Refs - always initialize
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single mount effect to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    // Simplified auth check
    setIsAuthenticated(true);
    setLoading(false);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', 'demo-user');
      logActivity('page_view', { page: 'dashboard' });
    }
  }, [logActivity]);

  // Always call useEffect for CRM contacts - but check conditions inside
  useEffect(() => {
    const fetchCrmContacts = async () => {
      if (contactSource !== 'crm') return;
      
      setLoadingCrmContacts(true);
      
      try {
        const response = await fetch(`/api/closecrm/list-contacts?page=${crmContactsPage}&query=${encodeURIComponent(crmContactSearch)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch contacts');
        }
        
        setCrmContacts(data.contacts || []);
      } catch (error) {
        console.error('Error fetching CRM contacts:', error);
      } finally {
        setLoadingCrmContacts(false);
      }
    };

    if (contactSource === 'crm') {
      fetchCrmContacts();
    }
  }, [contactSource, crmContactSearch, crmContactsPage]);

  // Always call useEffect for stats - but check conditions inside
  useEffect(() => {
    const fetchStats = async () => {
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
    };

    if (mounted && activeTab === 'stats') {
      fetchStats();
    }
  }, [mounted, activeTab, statsPeriod]);

  // Show loading state to prevent hydration mismatch
  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  // Don't render main content until client-side
  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  // Rest of the handlers and functions would go here...
  const handleSignOut = () => {
    logActivity('logout');
    alert('Sign out disabled for demo deployment. Refresh page to continue.');
  };

  // Simplified file change handler
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    try {
      const text = await file.text();
      let numbers: string[] = [];
      let parsedContactData: Array<{phone: string, name?: string, company?: string}> = [];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = text.split('\n');
        const headerRow = lines[0].toLowerCase();
        const hasHeader = headerRow.includes('phone') || headerRow.includes('name') || headerRow.includes('company');
        
        const startIndex = hasHeader ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const columns = line.split(',').map(col => col.trim());
            
            if (columns.length > 0 && columns[0]) {
              const phoneNumber = columns[0];
              numbers.push(phoneNumber);
              
              const contact: {phone: string, name?: string, company?: string} = {
                phone: phoneNumber
              };
              
              if (columns[1]) contact.name = columns[1];
              if (columns[2]) contact.company = columns[2];
              
              parsedContactData.push(contact);
            }
          }
        }
      } else {
        numbers = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
          
        parsedContactData = numbers.map(number => ({ phone: number }));
      }
      
      setPhoneNumbers(numbers);
      setContactData(parsedContactData);
      
    } catch (error) {
      console.error('Error reading file:', error);
      setSendStatus({
        success: false,
        message: 'Failed to read file. Please make sure it\'s a valid text or CSV file.'
      });
    }
  };

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
      setRecentRebuttals(prev => [{
        input: rebuttalInput,
        response: data.rebuttal
      }, ...prev.slice(0, 4)]); // Keep only last 5
      
      // Log the rebuttal generation
      logActivity('rebuttal_generated', {
        inputLength: rebuttalInput.length,
        responseLength: data.rebuttal.length
      });
      
    } catch (error) {
      console.error('Error generating rebuttal:', error);
      setRebuttalError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsGeneratingRebuttal(false);
    }
  };

  return (
    <div className="min-h-screen bg-tech-background">
      {/* Fixed Header */}
      <div className="bg-tech-card shadow-tech border-b border-tech-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-tech-foreground">TRD Dialer & SMS</h1>
              <div className="hidden md:block">
                <div className="text-sm text-gray-400">Multi-User Dashboard</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Welcome, Demo User
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-400 hover:text-tech-foreground transition-colors duration-200"
              >
                <LogoutIcon />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden sticky top-24">
              <div className="h-1 bg-gradient"></div>
              <div className="p-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('message-editor')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                      activeTab === 'message-editor'
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-tech-secondary hover:text-white'
                    }`}
                  >
                    <EditIcon />
                    <span>Message Editor</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('sms-chats')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                      activeTab === 'sms-chats'
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-tech-secondary hover:text-white'
                    }`}
                  >
                    <MessageIcon />
                    <span>SMS Chats</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('voice-dialer')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                      activeTab === 'voice-dialer'
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-tech-secondary hover:text-white'
                    }`}
                  >
                    <PhoneIcon />
                    <span>Voice Dialer</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                      activeTab === 'stats'
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-tech-secondary hover:text-white'
                    }`}
                  >
                    <StatsIcon />
                    <span>Statistics</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('ai-rebuttal')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                      activeTab === 'ai-rebuttal'
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-tech-secondary hover:text-white'
                    }`}
                  >
                    <AIIcon />
                    <span>AI Rebuttal</span>
                  </button>
                  
                  <Link
                    href="/admin"
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 text-gray-300 hover:bg-tech-secondary hover:text-white"
                  >
                    <ReportsIcon />
                    <span>Admin Panel</span>
                  </Link>
                  
                  <button
                    onClick={() => setActiveTab('drip-campaigns')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                      activeTab === 'drip-campaigns'
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-tech-secondary hover:text-white'
                    }`}
                  >
                    <DripCampaignIcon />
                    <span>Drip Campaigns</span>
                  </button>
                </nav>
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
        )}
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
