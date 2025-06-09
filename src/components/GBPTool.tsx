"use client";

import { useState, useRef, ChangeEvent } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Removed to avoid dependency issues

interface WebsiteData {
  url: string;
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  images: Array<{
    src: string;
    alt: string;
  }>;
  content: string;
}

interface AuditResult {
  overallScore: number;
  listingCompletenessScore: number;
  contentAlignmentScore: number;
  localSeoReadinessScore: number;
  recommendations: {
    critical: string[];
    important: string[];
    suggested: string[];
  };
  analysisSummary: string;
  businessName: string;
  reportUrl?: string;
  auditId?: string;
}

interface DetailedAuditResult extends AuditResult {
  aiSeoScore: number;
  googleAiReadiness: number;
  detailedAnalysis: {
    technicalSeo: {
      score: number;
      issues: string[];
      recommendations: string[];
    };
    contentQuality: {
      score: number;
      analysis: string;
      improvements: string[];
    };
    localSeoFactors: {
      score: number;
      napConsistency: number;
      localKeywords: number;
      reviewProfile: number;
    };
    googleAiOptimization: {
      score: number;
      schemaMarkup: number;
      featuredSnippets: number;
      voiceSearchReadiness: number;
      entityOptimization: number;
    };
    competitorAnalysis: {
      marketPosition: string;
      strengthsVsCompetitors: string[];
      opportunityGaps: string[];
    };
  };
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface SalesPitch {
  painPoints: string[];
  valueProposition: string;
  trdAdvantage: string;
  objectionHandlers: string[];
  closingQuestions: string[];
  aiScriptBenefits: string[];
  competitorComparison: string;
  roi: string;
}

export default function GBPTool() {
  const [url, setUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailedLoading, setIsDetailedLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [detailedResult, setDetailedResult] = useState<DetailedAuditResult | null>(null);
  const [salesPitch, setSalesPitch] = useState<SalesPitch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditResult[]>([]);
  const [activeSection, setActiveSection] = useState<'audit' | 'history' | 'reports' | 'pitch'>('audit');

  const handleAuditSubmit = async () => {
    if (!url.trim() && !businessName.trim()) {
      setError('Please enter either a website URL or business name');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDetailedResult(null); // Reset detailed results
    setSalesPitch(null); // Reset sales pitch

    try {
      // Get username from localStorage or use default
      const username = localStorage.getItem('username') || 'anonymous';
      
      const response = await fetch('/api/gbp/professional-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username, // Pass username for storage
        },
        body: JSON.stringify({
          url: url.trim(),
          businessName: businessName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Audit failed');
      }

      const result = await response.json();
      setAuditResult(result);
      setAuditHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 audits
      
      // Generate sales pitch based on audit results
      generateSalesPitch(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailedAudit = async () => {
    if (!auditResult) {
      setError('Please complete a basic audit first');
      return;
    }

    setIsDetailedLoading(true);
    setError(null);

    try {
      const username = localStorage.getItem('username') || 'anonymous';
      
      const response = await fetch('/api/gbp/detailed-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({
          url: url.trim(),
          businessName: businessName.trim(),
          basicAuditId: auditResult.auditId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Detailed audit failed');
      }

      const result = await response.json();
      setDetailedResult(result);
      
      // Update sales pitch with detailed audit insights
      generateDetailedSalesPitch(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsDetailedLoading(false);
    }
  };

  const generateSalesPitch = async (audit: AuditResult) => {
    const pitch: SalesPitch = {
      painPoints: [
        `${audit.businessName} is missing out on ${100 - audit.overallScore}% of their online visibility potential`,
        "Competitors with better optimization are stealing customers every day",
        "Google AI search is becoming dominant - businesses not prepared will be left behind",
        "Current marketing spend is less effective without proper digital foundation"
      ],
      valueProposition: `True Rank Digital's proprietary AI scripts can increase ${audit.businessName}'s online visibility by up to ${Math.min(40, 100 - audit.overallScore)}% within 90 days.`,
      trdAdvantage: "Unlike other agencies that use generic templates, TRD creates custom AI scripts tailored specifically to each business. Our backend AI continuously optimizes for Google's evolving algorithms.",
      objectionHandlers: [
        "\"Too expensive\": The cost of NOT optimizing is losing customers to competitors daily. Our AI ROI typically pays for itself within 60 days.",
        "\"We already have marketing\": Most marketing fails without proper digital foundation. We make your existing marketing 3x more effective.",
        "\"Need to think about it\": Every day you wait, competitors get stronger. Our AI scripts work 24/7 to keep you ahead."
      ],
      closingQuestions: [
        `How much revenue is ${audit.businessName} losing monthly by ranking below competitors?`,
        "If I could guarantee you'll outrank your main competitor within 90 days, would you move forward today?",
        "What's more expensive - investing in proven AI optimization or losing customers to better-optimized competitors?"
      ],
      aiScriptBenefits: [
        "🤖 Custom AI scripts that adapt to Google's daily algorithm changes",
        "📈 24/7 automated optimization - works while you sleep",
        "🎯 Targets exact keywords your customers are searching for",
        "⚡ Outpaces competitors who use outdated SEO methods",
        "🔄 Continuous learning from your industry's best performers"
      ],
      competitorComparison: `While competitors use manual, outdated SEO techniques, TRD's AI scripts automatically adjust to beat them. It's like having a full SEO team that never sleeps.`,
      roi: `Investment: Starting at $2,997/month. Expected Return: $10,000-50,000+ monthly from increased visibility and customer acquisition.`
    };

    setSalesPitch(pitch);
    
    // Save sales pitch to permanent storage
    try {
      await fetch('/api/gbp/save-sales-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditId: audit.auditId,
          salesPitchData: pitch,
        }),
      });
    } catch (error) {
      console.error('Failed to save sales pitch:', error);
      // Continue even if save fails
    }
  };

  const generateDetailedSalesPitch = async (detailedAudit: DetailedAuditResult) => {
    const enhancedPitch: SalesPitch = {
      painPoints: [
        `${detailedAudit.businessName} is only ${detailedAudit.googleAiReadiness}% ready for Google's AI search revolution`,
        `Schema markup score of ${detailedAudit.detailedAnalysis.googleAiOptimization.schemaMarkup}/100 means missing 70%+ of AI search opportunities`,
        "Voice search optimization at only 30% - missing the fastest-growing search method",
        "Competitors with better AI optimization are capturing market share daily"
      ],
      valueProposition: `TRD's advanced AI scripts can increase ${detailedAudit.businessName}'s Google AI readiness from ${detailedAudit.googleAiReadiness}% to 95%+ within 90 days, capturing significantly more AI-driven searches.`,
      trdAdvantage: "TRD's proprietary AI scripts specifically target Google's AI algorithms, voice search, and featured snippets. Our backend technology continuously optimizes for entity recognition and semantic search - areas most agencies don't even understand.",
      objectionHandlers: [
        "\"Sounds too technical\": That's exactly why you need us. Our AI handles all the technical complexity automatically while you focus on serving customers.",
        "\"Other agencies offer SEO too\": Generic SEO is dead. We optimize specifically for AI search algorithms that will dominate the next 5 years.",
        "\"Not ready for AI\": Your competitors are. Every month you wait, they get further ahead in AI search results."
      ],
      closingQuestions: [
        `How many customers is ${detailedAudit.businessName} losing to competitors who rank higher in AI search?`,
        "If our AI scripts could guarantee you outrank competitors in voice search within 60 days, what would that be worth?",
        "Would you rather be ahead of the AI curve or scrambling to catch up when it's too late?"
      ],
      aiScriptBenefits: [
        "🤖 Advanced AI entity optimization - Google's AI understands your business better",
        "🗣️ Voice search optimization - capture the 55% of adults using voice search",
        "⭐ Featured snippet targeting - dominate position zero results",
        "🧠 Semantic keyword clustering - rank for what customers actually mean",
        "🔮 Future-proof algorithms - stay ahead of Google's AI updates",
        "📊 Real-time competitor monitoring and response automation"
      ],
      competitorComparison: `Most agencies are 2-3 years behind Google's AI evolution. TRD's scripts are designed specifically for Google's current and future AI algorithms, giving you an unfair advantage.`,
      roi: `Investment: $4,997-9,997/month for AI optimization. Conservative ROI: 300-500% within 6 months. Businesses typically see 2-5x increase in qualified leads.`
    };

    setSalesPitch(enhancedPitch);
    
    // Save enhanced sales pitch to permanent storage
    try {
      await fetch('/api/gbp/save-sales-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditId: detailedAudit.auditId,
          salesPitchData: enhancedPitch,
        }),
      });
    } catch (error) {
      console.error('Failed to save enhanced sales pitch:', error);
      // Continue even if save fails
    }
  };

  const handleGenerateReport = async (audit: AuditResult) => {
    try {
      const response = await fetch('/api/gbp/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auditId: audit.auditId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TRD-AI-Audit-${audit.businessName}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-700"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-300 text-center mt-2">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-tech-background text-tech-foreground">
      {/* Header */}
      <div className="bg-tech-card border-b border-tech-border">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3">🏢</span>
                TRD AI Optimization Audit System
              </h1>
              <p className="text-gray-400 mt-1">
                Comprehensive AI SEO analysis with custom script recommendations
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Powered by GPT-4 Turbo + TRD AI Scripts
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-tech-card border-b border-tech-border">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'audit', name: 'New Audit', icon: '🔍' },
              { id: 'pitch', name: 'Sales Pitch', icon: '💼' },
              { id: 'history', name: 'Audit History', icon: '📊' },
              { id: 'reports', name: 'Reports', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.id === 'pitch' && salesPitch && (
                  <span className="ml-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">Ready</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* New Audit Section */}
        {activeSection === 'audit' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
            {/* Input Panel */}
            <div className="bg-tech-card rounded-lg shadow-tech h-fit">
              <div className="h-1 bg-gradient-accent"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.yourbusiness.com"
                      className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="text-center text-gray-400 text-sm">OR</div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Name & Location
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Tony's Pizza Restaurant, New York, NY"
                      className="w-full px-3 py-2 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {/* Basic Audit Button */}
                  <button
                    onClick={handleAuditSubmit}
                    disabled={isLoading || (!url.trim() && !businessName.trim())}
                    className={`w-full py-3 px-4 rounded-md flex items-center justify-center text-white ${
                      isLoading || (!url.trim() && !businessName.trim())
                        ? 'bg-tech-secondary cursor-not-allowed'
                        : 'bg-gradient-accent hover:shadow-accent'
                    } transition-shadow duration-300 mb-3`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing AI Optimization...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔍</span>
                        Start AI Optimization Audit
                      </>
                    )}
                  </button>

                  {/* Detailed Audit Button */}
                  {auditResult && (
                    <button
                      onClick={handleDetailedAudit}
                      disabled={isDetailedLoading}
                      className={`w-full py-3 px-4 rounded-md flex items-center justify-center text-white ${
                        isDetailedLoading
                          ? 'bg-tech-secondary cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } transition-colors duration-300`}
                    >
                      {isDetailedLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Advanced AI Analysis...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🚀</span>
                          Advanced AI Search Optimization
                        </>
                      )}
                    </button>
                  )}

                  {error && (
                    <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300 text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-tech-secondary rounded-md">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">TRD AI Audit Features:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• <strong>Basic Audit:</strong> GBP optimization + AI readiness assessment</li>
                    <li>• <strong>Advanced Audit:</strong> Google AI search optimization analysis</li>
                    <li>• <strong>Sales Pitch:</strong> Customized talking points for closing deals</li>
                    <li>• <strong>AI Scripts:</strong> Custom backend optimization recommendations</li>
                    <li>• <strong>Competitor Analysis:</strong> Strategic advantage identification</li>
                    <li>• <strong>Professional Reports:</strong> Client-ready PDF presentations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-tech-card rounded-lg shadow-tech flex flex-col">
              <div className="h-1 bg-gradient-accent"></div>
              <div className="flex-1 p-6 overflow-y-auto">
                {detailedResult ? (
                  // Detailed Results Display
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {detailedResult.businessName}
                      </h3>
                      <div className="text-3xl font-bold mb-2">
                        <span className={detailedResult.overallScore >= 80 ? "text-green-500" : detailedResult.overallScore >= 60 ? "text-yellow-500" : "text-red-500"}>
                          {detailedResult.overallScore}/100
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mb-4">AI Optimization Score</div>
                    </div>

                    {/* Advanced Score Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ScoreCircle score={detailedResult.aiSeoScore} label="AI SEO Ready" />
                      <ScoreCircle score={detailedResult.googleAiReadiness} label="Google AI Ready" />
                      <ScoreCircle score={detailedResult.detailedAnalysis.technicalSeo.score} label="Technical SEO" />
                      <ScoreCircle score={detailedResult.detailedAnalysis.contentQuality.score} label="Content Quality" />
                    </div>

                    {/* Google AI Optimization Details */}
                    <div className="bg-tech-secondary p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">🤖 Google AI Optimization</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Schema: <span className="text-accent">{detailedResult.detailedAnalysis.googleAiOptimization.schemaMarkup}/100</span></div>
                        <div>Snippets: <span className="text-accent">{detailedResult.detailedAnalysis.googleAiOptimization.featuredSnippets}/100</span></div>
                        <div>Voice: <span className="text-accent">{detailedResult.detailedAnalysis.googleAiOptimization.voiceSearchReadiness}/100</span></div>
                        <div>Entity: <span className="text-accent">{detailedResult.detailedAnalysis.googleAiOptimization.entityOptimization}/100</span></div>
                      </div>
                    </div>

                    {/* TRD AI Script Opportunities */}
                    <div className="bg-green-900 bg-opacity-20 p-4 rounded-lg border border-green-500">
                      <h4 className="text-sm font-semibold text-green-400 mb-2">🚀 TRD AI Script Opportunities</h4>
                      <div className="text-xs text-green-300 space-y-1">
                        <div>• Custom entity optimization scripts: +{Math.max(10, 100 - detailedResult.detailedAnalysis.googleAiOptimization.entityOptimization)}% improvement potential</div>
                        <div>• Voice search targeting: +{Math.max(15, 100 - detailedResult.detailedAnalysis.googleAiOptimization.voiceSearchReadiness)}% voice visibility</div>
                        <div>• Featured snippet automation: +{Math.max(5, 100 - detailedResult.detailedAnalysis.googleAiOptimization.featuredSnippets)}% snippet capture rate</div>
                      </div>
                    </div>

                    {/* Action Plan */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">⚡ Immediate TRD Implementation</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {detailedResult.actionPlan.immediate.slice(0, 3).map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Competitor Analysis */}
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">🏆 Competitive Advantage</h4>
                      <div className="text-sm text-gray-400 bg-tech-secondary p-3 rounded-md">
                        {detailedResult.detailedAnalysis.competitorAnalysis.marketPosition}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateReport(detailedResult)}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                      >
                        📄 Generate Client Report
                      </button>
                      <button
                        onClick={() => setActiveSection('pitch')}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                      >
                        💼 View Sales Pitch
                      </button>
                    </div>
                  </div>
                ) : auditResult ? (
                  // Basic Results Display
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {auditResult.businessName}
                      </h3>
                      <div className="text-3xl font-bold">
                        <span className={auditResult.overallScore >= 80 ? "text-green-500" : auditResult.overallScore >= 60 ? "text-yellow-500" : "text-red-500"}>
                          {auditResult.overallScore}/100
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Current Optimization Score</div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-3 gap-4">
                      <ScoreCircle 
                        score={auditResult.listingCompletenessScore} 
                        label="Listing Completeness" 
                      />
                      <ScoreCircle 
                        score={auditResult.contentAlignmentScore} 
                        label="Content Alignment" 
                      />
                      <ScoreCircle 
                        score={auditResult.localSeoReadinessScore} 
                        label="Local SEO Readiness" 
                      />
                    </div>

                    {/* TRD Opportunity */}
                    <div className="bg-yellow-900 bg-opacity-20 p-4 rounded-lg border border-yellow-500">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">💡 TRD AI Opportunity</h4>
                      <div className="text-sm text-yellow-300">
                        With TRD's AI scripts, {auditResult.businessName} could improve by up to {Math.min(40, 100 - auditResult.overallScore)} points, 
                        capturing significantly more customers than competitors.
                      </div>
                    </div>

                    {/* Analysis Summary */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Analysis Summary</h4>
                      <div className="text-sm text-gray-400 bg-tech-secondary p-3 rounded-md">
                        {auditResult.analysisSummary}
                      </div>
                    </div>

                    {/* Critical Recommendations */}
                    {auditResult.recommendations.critical.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center">
                          🚨 Priority Issues (TRD Can Fix)
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {auditResult.recommendations.critical.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-400 mr-2 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateReport(auditResult)}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                      >
                        📄 Generate Report
                      </button>
                      <button
                        onClick={() => setActiveSection('pitch')}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                      >
                        💼 Get Sales Pitch
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-4xl mb-4">🏢</div>
                    <p>Enter business information to start your AI optimization audit</p>
                    <div className="mt-4 text-sm">
                      <div className="mb-2">🔍 <strong>Basic Audit:</strong> Current optimization assessment</div>
                      <div className="mb-2">🚀 <strong>AI Audit:</strong> Advanced Google AI readiness</div>
                      <div>💼 <strong>Sales Pitch:</strong> Custom talking points for closing</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sales Pitch Section */}
        {activeSection === 'pitch' && (
          <div className="max-w-6xl mx-auto">
            {salesPitch ? (
              <div className="space-y-6">
                <div className="bg-tech-card rounded-lg shadow-tech p-6">
                  <div className="h-1 bg-gradient-accent mb-6"></div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    💼 Sales Pitch Guide
                    <span className="ml-3 text-sm bg-green-500 px-2 py-1 rounded">Ready to Present</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pain Points */}
                    <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500">
                      <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                        🚨 Pain Points to Highlight
                      </h3>
                      <ul className="space-y-2">
                        {salesPitch.painPoints.map((point, index) => (
                          <li key={index} className="text-sm text-red-300 flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Value Proposition */}
                    <div className="bg-green-900 bg-opacity-20 p-4 rounded-lg border border-green-500">
                      <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                        🎯 Value Proposition
                      </h3>
                      <p className="text-sm text-green-300">{salesPitch.valueProposition}</p>
                    </div>

                    {/* TRD Advantage */}
                    <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-500">
                      <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                        ⚡ TRD Competitive Advantage
                      </h3>
                      <p className="text-sm text-blue-300 mb-3">{salesPitch.trdAdvantage}</p>
                      <div className="text-xs text-blue-200">{salesPitch.competitorComparison}</div>
                    </div>

                    {/* AI Script Benefits */}
                    <div className="bg-purple-900 bg-opacity-20 p-4 rounded-lg border border-purple-500">
                      <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                        🤖 AI Script Benefits to Emphasize
                      </h3>
                      <ul className="space-y-1">
                        {salesPitch.aiScriptBenefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-purple-300">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Objection Handlers */}
                <div className="bg-tech-card rounded-lg shadow-tech p-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                    🛡️ Objection Handlers
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {salesPitch.objectionHandlers.map((handler, index) => (
                      <div key={index} className="bg-yellow-900 bg-opacity-20 p-3 rounded border border-yellow-600">
                        <p className="text-sm text-yellow-300">{handler}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Closing Questions */}
                <div className="bg-tech-card rounded-lg shadow-tech p-6">
                  <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center">
                    💰 Closing Questions
                  </h3>
                  <div className="space-y-3">
                    {salesPitch.closingQuestions.map((question, index) => (
                      <div key={index} className="bg-orange-900 bg-opacity-20 p-3 rounded border border-orange-600">
                        <p className="text-sm text-orange-300 font-medium">"{question}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROI Information */}
                <div className="bg-tech-card rounded-lg shadow-tech p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                    📈 Investment & ROI
                  </h3>
                  <div className="bg-green-900 bg-opacity-20 p-4 rounded border border-green-600">
                    <p className="text-green-300">{salesPitch.roi}</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(salesPitch, null, 2))}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    📋 Copy All Talking Points
                  </button>
                  <button
                    onClick={() => setActiveSection('audit')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    ← Back to Audit
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-4">💼</div>
                <p>Complete an audit first to generate custom sales talking points</p>
                <button
                  onClick={() => setActiveSection('audit')}
                  className="mt-4 px-6 py-3 bg-accent hover:bg-accent-light text-white rounded-md transition-colors"
                >
                  Start Audit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Audit History Section */}
        {activeSection === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Audits</h3>
            {auditHistory.length > 0 ? (
              <div className="grid gap-4">
                {auditHistory.map((audit, index) => (
                  <div
                    key={index}
                    className="bg-tech-card rounded-lg p-4 shadow-tech"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{audit.businessName}</h4>
                        <div className="text-sm text-gray-400">
                          Overall Score: <span className={audit.overallScore >= 80 ? "text-green-500" : audit.overallScore >= 60 ? "text-yellow-500" : "text-red-500"}>
                            {audit.overallScore}/100
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setAuditResult(audit)}
                          className="px-3 py-1 bg-accent hover:bg-accent-light text-white rounded text-sm transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleGenerateReport(audit)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          PDF Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-4">📊</div>
                <p>No audit history yet. Complete your first audit to see results here.</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Report Management</h3>
            <div className="bg-tech-card rounded-lg p-6 shadow-tech">
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-4">📄</div>
                <p>Permanent report storage and management coming soon.</p>
                <p className="text-sm mt-2">All reports will be saved forever with Supabase integration.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 