'use client';

import React, { useState } from 'react';

interface TutorialsGuideProps {
  isActive: boolean;
}

const TutorialsGuide: React.FC<TutorialsGuideProps> = ({ isActive }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isActive) return null;

  const tutorialSections = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: '🏠',
      description: 'Get started with TRD SMS Platform'
    },
    {
      id: 'messaging',
      title: 'Mass Messaging',
      icon: '📱',
      description: 'Send bulk SMS campaigns'
    },
    {
      id: 'drip-campaigns',
      title: 'Drip Campaigns',
      icon: '⏰',
      description: 'Automated message sequences'
    },
    {
      id: 'ai-tools',
      title: 'AI Sales Tools',
      icon: '🤖',
      description: 'GPT-4o powered assistance'
    },
    {
      id: 'gbp-audit',
      title: 'GBP Audit Tool',
      icon: '🏢',
      description: 'Google Business Profile audits'
    }
  ];

  const renderOverviewTutorial = () => (
    <div className="space-y-6">
      <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-md p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-blue-400 font-medium">Welcome to TRD SMS Platform</p>
            <p className="text-blue-300 text-sm mt-1">
              Your complete communication and sales automation solution.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">1</div>
          <div>
            <h4 className="font-medium text-tech-foreground">Navigation</h4>
            <p className="text-gray-400 text-sm mt-1">
              Use the left sidebar to navigate between different tools. Each section has specific features for different aspects of your sales process.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">2</div>
          <div>
            <h4 className="font-medium text-tech-foreground">SMS Gateway Setup</h4>
            <p className="text-gray-400 text-sm mt-1">
              Check "SMS Health Check" to verify your messaging system is working. Visit "GateSMS Setup" if you need to configure your device.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 mt-1">3</div>
          <div>
            <h4 className="font-medium text-tech-foreground">Start Messaging</h4>
            <p className="text-gray-400 text-sm mt-1">
              Go to "Message Sender" to send single messages or mass campaigns. Upload CSV files or use templates to get started quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessagingTutorial = () => (
    <div className="space-y-6">
      <div className="bg-green-900 bg-opacity-20 border border-green-500 rounded-md p-4">
        <h4 className="text-green-400 font-medium mb-2">Mass Messaging Features</h4>
        <ul className="text-green-300 text-sm space-y-1">
          <li>• Send to thousands of contacts at once</li>
          <li>• 50+ professional templates included</li>
          <li>• CSV upload with smart field mapping</li>
          <li>• Real-time delivery tracking</li>
          <li>• AI message optimization</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-tech-foreground">Step-by-Step Guide:</h4>
        
        <div className="border-l-4 border-blue-500 pl-4">
          <h5 className="font-medium text-blue-400 mb-2">Single Message Mode</h5>
          <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
            <li>Click "Message Sender" in the sidebar</li>
            <li>Toggle to "Single Message" mode (top-right)</li>
            <li>Enter phone number (auto-formatted)</li>
            <li>Type your message or use quick templates</li>
            <li>Click "Send Message"</li>
          </ol>
        </div>

        <div className="border-l-4 border-purple-500 pl-4">
          <h5 className="font-medium text-purple-400 mb-2">Mass Campaign Mode</h5>
          <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
            <li>Stay in "Mass Campaign" mode</li>
            <li>Upload CSV file with contacts</li>
            <li>Map phone/name/company columns</li>
            <li>Choose or create message template</li>
            <li>Use variables like {`{name}`}, {`{company}`}</li>
            <li>Preview message with real data</li>
            <li>Launch campaign and track results</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const renderDripCampaignsTutorial = () => (
    <div className="space-y-6">
      <div className="bg-purple-900 bg-opacity-20 border border-purple-500 rounded-md p-4">
        <h4 className="text-purple-400 font-medium mb-2">Automated Follow-up Sequences</h4>
        <p className="text-purple-300 text-sm">
          Set up automated message sequences that send over time to nurture leads and maintain engagement.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-tech-foreground">Creating a Drip Campaign:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-tech-secondary bg-opacity-30 p-4 rounded-md">
            <h5 className="font-medium text-tech-foreground mb-2">Campaign Setup</h5>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Choose campaign name</li>
              <li>• Select contact source (CRM/File)</li>
              <li>• Set up 9 message templates</li>
              <li>• Configure send intervals</li>
            </ul>
          </div>

          <div className="bg-tech-secondary bg-opacity-30 p-4 rounded-md">
            <h5 className="font-medium text-tech-foreground mb-2">Message Templates</h5>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Day 1: Introduction message</li>
              <li>• Day 3: Value proposition</li>
              <li>• Day 5: Social proof</li>
              <li>• Day 7+: Continued nurturing</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-900 bg-opacity-20 border border-amber-500 rounded-md p-3">
          <h5 className="text-amber-400 font-medium mb-1">Pro Tip</h5>
          <p className="text-amber-300 text-sm">
            Use different messaging strategies for each day. Start with introductions, then provide value, share testimonials, and end with clear calls-to-action.
          </p>
        </div>
      </div>
    </div>
  );

  const renderAIToolsTutorial = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-20 border border-purple-500 rounded-md p-4">
        <h4 className="text-purple-400 font-medium mb-2">AI-Powered Sales Assistant</h4>
        <p className="text-purple-300 text-sm">
          Leverage GPT-4o for content creation, lead research, and sales optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="font-medium text-tech-foreground mb-3">Available AI Tools:</h5>
          <div className="space-y-3">
            <div className="border-l-3 border-blue-400 pl-3">
              <h6 className="text-blue-400 font-medium">SEO Audit</h6>
              <p className="text-gray-400 text-sm">Analyze website SEO performance</p>
            </div>
            <div className="border-l-3 border-green-400 pl-3">
              <h6 className="text-green-400 font-medium">Lead Research</h6>
              <p className="text-gray-400 text-sm">Research prospects and companies</p>
            </div>
            <div className="border-l-3 border-purple-400 pl-3">
              <h6 className="text-purple-400 font-medium">Content Creation</h6>
              <p className="text-gray-400 text-sm">Generate sales copy and emails</p>
            </div>
            <div className="border-l-3 border-yellow-400 pl-3">
              <h6 className="text-yellow-400 font-medium">CSV Processing</h6>
              <p className="text-gray-400 text-sm">Clean and format contact lists</p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-tech-foreground mb-3">How to Use:</h5>
          <ol className="list-decimal list-inside text-gray-300 text-sm space-y-2">
            <li>Select AI tool from dropdown</li>
            <li>Enter your query or upload file</li>
            <li>Review AI-generated response</li>
            <li>Copy or download results</li>
            <li>Apply insights to your campaigns</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const renderGBPAuditTutorial = () => (
    <div className="space-y-6">
      <div className="bg-orange-900 bg-opacity-20 border border-orange-500 rounded-md p-4">
        <h4 className="text-orange-400 font-medium mb-2">Google Business Profile Analysis</h4>
        <p className="text-orange-300 text-sm">
          Comprehensive audit tool for local business optimization and competitive analysis.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-tech-foreground">Audit Process:</h4>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <h5 className="font-medium text-tech-foreground">Business Information</h5>
              <p className="text-gray-400 text-sm">Enter business name, location, and industry for comprehensive analysis.</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <h5 className="font-medium text-tech-foreground">Competitor Analysis</h5>
              <p className="text-gray-400 text-sm">Automatic identification and analysis of local competitors.</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <h5 className="font-medium text-tech-foreground">Optimization Recommendations</h5>
              <p className="text-gray-400 text-sm">Actionable insights for improving local search visibility.</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-3">📋</span>
            <div>
              <h5 className="font-medium text-tech-foreground">Detailed Report</h5>
              <p className="text-gray-400 text-sm">Professional PDF report for client presentations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverviewTutorial();
      case 'messaging': return renderMessagingTutorial();
      case 'drip-campaigns': return renderDripCampaignsTutorial();
      case 'ai-tools': return renderAIToolsTutorial();
      case 'gbp-audit': return renderGBPAuditTutorial();
      default: return renderOverviewTutorial();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold">Platform Tutorials</h2>
          <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Complete Learning Guide
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Tutorial Navigation */}
          <div className="xl:col-span-1">
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden sticky top-8">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Tutorial Sections</h3>
                <div className="space-y-2">
                  {tutorialSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                        activeSection === section.id
                          ? 'bg-primary text-white'
                          : 'bg-tech-secondary hover:bg-tech-border'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{section.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{section.title}</div>
                          <div className="text-xs opacity-75">{section.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tutorial Content */}
          <div className="xl:col-span-3">
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-4">
                    {tutorialSections.find(s => s.id === activeSection)?.icon}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-tech-foreground">
                      {tutorialSections.find(s => s.id === activeSection)?.title}
                    </h3>
                    <p className="text-gray-400">
                      {tutorialSections.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                </div>
                
                {renderContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="mt-8 bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Need Additional Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📞</div>
                <h4 className="font-medium text-tech-foreground">Technical Support</h4>
                <p className="text-gray-400 text-sm">bishop@truerankdigital.com</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔧</div>
                <h4 className="font-medium text-tech-foreground">Platform Training</h4>
                <p className="text-gray-400 text-sm">Complete video tutorials available</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-medium text-tech-foreground">Documentation</h4>
                <p className="text-gray-400 text-sm">Comprehensive guides available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialsGuide; 