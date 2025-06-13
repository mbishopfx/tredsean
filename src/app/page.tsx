'use client';

import { useState, useEffect } from 'react';
import { AdvancedMessageSender } from './components/AdvancedMessageSender';
import SMSTestingLab from './components/SMSTestingLab';
import { CSVValidator } from './components/CSVValidator';
import { AuthModal } from './components/AuthModal';
import { CampaignHistory } from './components/CampaignHistory';
import { TwilioBackupGuide } from './components/TwilioBackupGuide';
import { TabComponent } from './components/TabComponent';
import { StorageDashboard } from './components/StorageDashboard';
// Import proper components from src/components
import HomeFeed from '../components/HomeFeed';
import GBPTool from '../components/GBPTool';
import TutorialsGuide from '../components/TutorialsGuide';
import GateSMSSetupGuide from '../components/GateSMSSetupGuide';

// Icons
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const StatsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.051l.693.308a2.25 2.25 0 11-2.8 3.085l-4.182-2.608M19.25 4.46l-4.532 7.794a2.25 2.25 0 001.937 3.363h0a2.25 2.25 0 002.013-1.244l4.096-8.242" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const TutorialsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// AI Tools Component
const AIToolsInterface = () => {
  const [selectedTool, setSelectedTool] = useState('email-generator');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Array<{tool: string, input: string, output: string, timestamp: Date}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(12);
  const [totalUsage, setTotalUsage] = useState(347);

  // Function to format output text with HTML
  const formatOutput = (text: string) => {
    let formatted = text
      // Headers
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-primary mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-accent mt-4 mb-2">$1</h3>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
      
      // Subject lines
      .replace(/^Subject: (.*$)/gm, '<div class="mb-4"><strong class="text-accent">Subject:</strong> <span class="font-semibold">$1</span></div>')
      
      // Bullet points - convert to list items
      .replace(/^- (.*$)/gm, '<li class="mb-2">$1</li>')
      
      // Numbered lists
      .replace(/^(\d+)\. (.*$)/gm, '<li class="mb-2">$2</li>');
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li class="mb-2">.*?<\/li>)(\s*<li class="mb-2">.*?<\/li>)*/g, (match) => {
      return '<ul class="list-disc list-inside mb-4 ml-4 space-y-1">' + match + '</ul>';
    });
    
    // Split into paragraphs and format
    const lines = formatted.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        if (currentParagraph) {
          paragraphs.push(currentParagraph);
          currentParagraph = '';
        }
      } else if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<ul') || trimmedLine.startsWith('<div')) {
        if (currentParagraph) {
          paragraphs.push('<p class="mb-4">' + currentParagraph + '</p>');
          currentParagraph = '';
        }
        paragraphs.push(trimmedLine);
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
      }
    }
    
    if (currentParagraph) {
      paragraphs.push('<p class="mb-4">' + currentParagraph + '</p>');
    }
    
    return paragraphs.join('\n');
  };

  const tools = [
    {
      id: 'email-generator',
      name: 'Email Generator',
      description: 'Generate professional sales emails',
      icon: '📧',
      category: 'Communication',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'proposal-writer',
      name: 'Proposal Writer',
      description: 'Create compelling business proposals',
      icon: '📝',
      category: 'Documents',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'objection-handler',
      name: 'Objection Handler',
      description: 'Handle customer objections effectively',
      icon: '🛡️',
      category: 'Strategy',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'follow-up-sequence',
      name: 'Follow-up Sequence',
      description: 'Create automated follow-up sequences',
      icon: '🔄',
      category: 'Automation',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'cold-outreach',
      name: 'Cold Outreach',
      description: 'Generate cold outreach messages',
      icon: '❄️',
      category: 'Prospecting',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'social-media',
      name: 'Social Media Posts',
      description: 'Create engaging social media content',
      icon: '📱',
      category: 'Social Media',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const handleToolSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: selectedTool,
          input: inputText,
          userId: localStorage.getItem('username') || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setOutputText(data.output);
      
      // Add to history
      const newEntry = {
        tool: selectedTool,
        input: inputText,
        output: data.output,
        timestamp: new Date()
      };
      
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10
      setDailyUsage(prev => prev + 1);
      setTotalUsage(prev => prev + 1);
      
      // Save to localStorage
      localStorage.setItem('ai_tools_history', JSON.stringify([newEntry, ...history.slice(0, 9)]));
      
    } catch (error) {
      console.error('Error generating content:', error);
      setOutputText('Sorry, there was an error generating content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8 bg-tech-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">AI Sales Tools</h1>
          <p className="text-xl text-tech-foreground/70">
            Generate professional sales content with AI
          </p>
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{dailyUsage}</div>
              <div className="text-sm text-tech-foreground/60">Today's Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalUsage}</div>
              <div className="text-sm text-tech-foreground/60">Total Generated</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tool Selection */}
          <div className="lg:col-span-1">
            <div className="bg-tech-card/80 backdrop-blur-xl p-6 rounded-xl border border-tech-border/30 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">Choose Your AI Tool</h2>
              <div className="space-y-3">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                      selectedTool === tool.id
                        ? 'bg-gradient-to-r ' + tool.color + ' text-white shadow-lg'
                        : 'bg-tech-background/50 text-tech-foreground hover:bg-tech-background/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm opacity-70">{tool.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full mt-6 p-3 bg-tech-background/50 text-tech-foreground rounded-lg hover:bg-tech-background/70 transition-all duration-300"
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-2">
            <div className="bg-tech-card/80 backdrop-blur-xl p-6 rounded-xl border border-tech-border/30">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {tools.find(t => t.id === selectedTool)?.name}
                </h3>
                <p className="text-tech-foreground/70">
                  {tools.find(t => t.id === selectedTool)?.description}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-tech-foreground mb-2">
                    Input
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full p-4 bg-tech-background/50 text-tech-foreground rounded-lg border border-tech-border/30 focus:border-primary focus:outline-none min-h-[120px]"
                    placeholder="Enter your requirements or context..."
                  />
                </div>

                <button
                  onClick={handleToolSubmit}
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full p-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Generating...' : 'Generate Content'}
                </button>

                {outputText && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-tech-foreground">
                        Generated Content
                      </label>
                      <button
                        onClick={() => copyToClipboard(outputText)}
                        className="text-primary hover:text-accent text-sm"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div 
                      className="p-4 bg-tech-background/50 text-tech-foreground rounded-lg border border-tech-border/30 formatted-content"
                      dangerouslySetInnerHTML={{ 
                        __html: formatOutput(outputText)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* History Section */}
            {showHistory && history.length > 0 && (
              <div className="mt-8 bg-tech-card/80 backdrop-blur-xl p-6 rounded-xl border border-tech-border/30">
                <h3 className="text-xl font-bold text-white mb-4">Recent History</h3>
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div key={index} className="p-4 bg-tech-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-primary font-medium">
                          {tools.find(t => t.id === entry.tool)?.name}
                        </span>
                        <span className="text-sm text-tech-foreground/60">
                          {entry.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-tech-foreground/70 mb-2">
                        Input: {entry.input.slice(0, 100)}...
                      </div>
                      <div className="text-sm text-tech-foreground">
                        {entry.output.slice(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
function DashboardContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [userRole, setUserRole] = useState('user');

  // Force fresh login on every page load
  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    
    setLoading(false);
    setIsAuthenticated(false);
  }, []);

  const handleAuthenticate = (role: string, userInfo?: any) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setLoading(false);
    
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    if (userInfo?.username) {
      localStorage.setItem('username', userInfo.username);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole('user');
    setActiveTab('home');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-tech-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-tech-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthModal 
        isOpen={true}
        onClose={() => {}}
        onAuthenticate={handleAuthenticate}
        type="team"
        title="Authentication Required"
        description="Please login to access the dashboard"
      />
    );
  }

  return (
    <div className="flex h-screen bg-tech-background text-tech-foreground">
      <div className="w-64 bg-tech-card/80 backdrop-blur-xl relative overflow-hidden border-r border-tech-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative p-6 z-10">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">True Rank Digital</span> 
            <span className="text-accent">Elite Dashboard</span>
          </h1>
          <p className="text-sm opacity-75 text-tech-foreground/70">Advanced Communication Platform</p>
        </div>
        
        <nav className="relative mt-8 z-10 px-2">
          <div 
            className={`group flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'home' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <HomeIcon />
            <span className="ml-3 font-medium">Home Feed</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'message-sender' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('message-sender')}
          >
            <EditIcon />
            <span className="ml-3 font-medium">Message Sender</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'sms-testing-lab' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('sms-testing-lab')}
          >
            <StatsIcon />
            <span className="ml-3 font-medium">SMS Testing Lab</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'campaign-history' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('campaign-history')}
          >
            <ReportsIcon />
            <span className="ml-3 font-medium">Campaign Analytics</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'gbp-tool' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('gbp-tool')}
          >
            <span className="w-6 h-6 text-xl">🏢</span>
            <span className="ml-3 font-medium">GBP Audit Tool</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'ai-tools' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('ai-tools')}
          >
            <AIIcon />
            <span className="ml-3 font-medium">AI Sales Tools</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'twilio-backup' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('twilio-backup')}
          >
            <MessageIcon />
            <span className="ml-3 font-medium">Twilio Backup</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'gatesms-setup' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('gatesms-setup')}
          >
            <MessageIcon />
            <span className="ml-3 font-medium">GateSMS Setup</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'storage-dashboard' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('storage-dashboard')}
          >
            <StatsIcon />
            <span className="ml-3 font-medium">Storage Dashboard</span>
          </div>
          
          <div 
            className={`group flex items-center px-4 py-3 mx-2 mt-2 rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === 'tutorials' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-white/10 hover:border hover:border-white/20'
            }`}
            onClick={() => setActiveTab('tutorials')}
          >
            <TutorialsIcon />
            <span className="ml-3 font-medium">Tutorials</span>
          </div>
          
          <button 
            onClick={handleSignOut} 
            className="group flex items-center px-4 py-3 mx-2 mt-4 rounded-xl cursor-pointer transition-all duration-300 text-red-400 hover:bg-red-500/10 hover:backdrop-blur-md hover:shadow-lg hover:shadow-red-500/10 hover:border hover:border-red-500/20"
          >
            <LogoutIcon />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto bg-tech-background">
        <div className={activeTab === 'home' ? 'block' : 'hidden'}>
          <HomeFeed onNavigate={setActiveTab} />
        </div>

        <div className={activeTab === 'gbp-tool' ? 'block' : 'hidden'}>
          <GBPTool />
        </div>
        
        <div className={activeTab === 'message-sender' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <CSVValidator onAutoStage={() => {}} />
            <AdvancedMessageSender isActive={true} logActivity={() => {}} />
          </div>
        </div>

        <div className={activeTab === 'sms-testing-lab' ? 'block' : 'hidden'}>
          <SMSTestingLab />
        </div>

        <div className={activeTab === 'campaign-history' ? 'block' : 'hidden'}>
          <CampaignHistory isActive={true} />
        </div>

        <div className={activeTab === 'ai-tools' ? 'block' : 'hidden'}>
          <AIToolsInterface />
        </div>

        <div className={activeTab === 'twilio-backup' ? 'block' : 'hidden'}>
          <TwilioBackupGuide isActive={true} />
        </div>

        <div className={activeTab === 'gatesms-setup' ? 'block' : 'hidden'}>
          <GateSMSSetupGuide isActive={true} />
        </div>

        <div className={activeTab === 'storage-dashboard' ? 'block' : 'hidden'}>
          <StorageDashboard isActive={true} />
        </div>

        <div className={activeTab === 'tutorials' ? 'block' : 'hidden'}>
          <div className="p-8">
            <TabComponent isActive={true}>
              <TutorialsGuide isActive={true} />
            </TabComponent>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <DashboardContent />;
} 