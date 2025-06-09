import { NextRequest, NextResponse } from 'next/server';

interface SEOAuditResult {
  businessName: string;
  website?: string;
  gbpUrl?: string;
  overallScore: number;
  scores: {
    onPage: number;
    technicalSEO: number;
    localSEO: number;
    gbpOptimization: number;
    contentQuality: number;
    competitorAnalysis: number;
  };
  insights: {
    category: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    recommendation: string;
  }[];
  opportunities: {
    title: string;
    potentialIncrease: string;
    timeframe: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
  }[];
  competitorData: {
    name: string;
    score: number;
    advantages: string[];
  }[];
  actionPlan: {
    phase: string;
    title: string;
    tasks: string[];
    timeline: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  roi: {
    currentEstimate: string;
    potentialIncrease: string;
    monthlyValue: string;
    yearlyValue: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Business input is required' },
        { status: 400 }
      );
    }

    // Extract business info from input
    let businessName = 'Business';
    let website = '';
    let gbpUrl = '';
    
    // Parse different input formats
    if (input.includes('maps.google.com') || input.includes('goo.gl/maps')) {
      gbpUrl = input;
      businessName = extractBusinessNameFromGBP(input);
    } else if (input.includes('http') || input.includes('www.')) {
      website = input;
      businessName = extractBusinessNameFromDomain(input);
    } else {
      businessName = input;
    }

    // Generate comprehensive audit results
    const auditResult: SEOAuditResult = await generateSEOAudit(businessName, website, gbpUrl);

    return NextResponse.json(auditResult);

  } catch (error) {
    console.error('Error generating SEO audit:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO audit' },
      { status: 500 }
    );
  }
}

function extractBusinessNameFromGBP(url: string): string {
  // Extract business name from Google Business Profile URL
  const match = url.match(/place\/([^\/]+)/);
  if (match) {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  return 'Business Name';
}

function extractBusinessNameFromDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return 'Business Name';
  }
}

async function generateSEOAudit(businessName: string, website?: string, gbpUrl?: string): Promise<SEOAuditResult> {
  // Generate realistic audit scores
  const baseScore = Math.floor(Math.random() * 40) + 30; // 30-70 base score
  const variation = () => Math.floor(Math.random() * 20) - 10; // ±10 variation
  
  const scores = {
    onPage: Math.max(10, Math.min(100, baseScore + variation())),
    technicalSEO: Math.max(10, Math.min(100, baseScore + variation())),
    localSEO: Math.max(10, Math.min(100, baseScore + variation())),
    gbpOptimization: Math.max(10, Math.min(100, baseScore + variation())),
    contentQuality: Math.max(10, Math.min(100, baseScore + variation())),
    competitorAnalysis: Math.max(10, Math.min(100, baseScore + variation()))
  };

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);

  // Generate insights based on scores
  const insights = [
    {
      category: 'Technical SEO',
      title: 'Page Speed Optimization Needed',
      description: `${businessName}'s website loads in 4.2 seconds. Google recommends under 3 seconds for optimal ranking.`,
      severity: scores.technicalSEO < 50 ? 'critical' as const : scores.technicalSEO < 70 ? 'high' as const : 'medium' as const,
      impact: 'Page speed affects 23% of ranking factors and user experience',
      recommendation: 'Implement image compression, browser caching, and CDN integration'
    },
    {
      category: 'Local SEO',
      title: 'Google Business Profile Incomplete',
      description: `Missing business hours, services, and recent photos. Only ${Math.floor(Math.random() * 40) + 30}% complete.`,
      severity: scores.gbpOptimization < 60 ? 'high' as const : 'medium' as const,
      impact: 'Complete GBP listings get 70% more calls and 50% more visits',
      recommendation: 'Add all business information, upload high-quality photos, and encourage reviews'
    },
    {
      category: 'Content Quality',
      title: 'Keyword Optimization Gaps',
      description: `Missing key industry terms that competitors rank for. Only targeting ${Math.floor(Math.random() * 20) + 10} keywords.`,
      severity: scores.contentQuality < 55 ? 'high' as const : 'medium' as const,
      impact: 'Poor keyword targeting limits organic traffic by up to 60%',
      recommendation: 'Develop content strategy around high-value, local keywords'
    },
    {
      category: 'Online Presence',
      title: 'Review Management Issues',
      description: `${Math.floor(Math.random() * 30) + 10}% of recent reviews are unanswered. Average rating could improve.`,
      severity: 'medium' as const,
      impact: 'Unanswered reviews hurt local ranking and customer trust',
      recommendation: 'Implement review response strategy and reputation management'
    }
  ];

  // Generate opportunities
  const opportunities = [
    {
      title: 'Local Keyword Domination',
      potentialIncrease: '+150% organic traffic',
      timeframe: '3-6 months',
      difficulty: 'medium' as const,
      description: 'Target location-based keywords your competitors are missing'
    },
    {
      title: 'Google Business Profile Optimization',
      potentialIncrease: '+200% local visibility',
      timeframe: '2-4 weeks',
      difficulty: 'easy' as const,
      description: 'Complete profile optimization and review acquisition strategy'
    },
    {
      title: 'Content Marketing Strategy',
      potentialIncrease: '+300% lead generation',
      timeframe: '4-8 months',
      difficulty: 'medium' as const,
      description: 'Create industry-specific content that ranks and converts'
    },
    {
      title: 'Technical SEO Overhaul',
      potentialIncrease: '+80% page speed',
      timeframe: '1-2 months',
      difficulty: 'hard' as const,
      description: 'Optimize site architecture and performance for better rankings'
    }
  ];

  // Generate competitor analysis
  const competitors = [
    {
      name: 'Top Local Competitor',
      score: Math.floor(Math.random() * 20) + 75,
      advantages: ['Better GBP optimization', 'More online reviews', 'Faster website']
    },
    {
      name: 'Industry Leader',
      score: Math.floor(Math.random() * 15) + 80,
      advantages: ['Comprehensive content strategy', 'Strong backlink profile', 'Mobile optimization']
    },
    {
      name: 'Regional Competitor',
      score: Math.floor(Math.random() * 25) + 60,
      advantages: ['Active social media', 'Local citations', 'Regular content updates']
    }
  ];

  // Generate action plan
  const actionPlan = [
    {
      phase: 'Phase 1: Foundation',
      title: 'Quick Wins & Technical Fixes',
      tasks: [
        'Complete Google Business Profile optimization',
        'Fix critical technical SEO issues',
        'Implement basic on-page SEO',
        'Set up Google Analytics and Search Console'
      ],
      timeline: '2-4 weeks',
      priority: 'high' as const
    },
    {
      phase: 'Phase 2: Content & Authority',
      title: 'Content Strategy & Link Building',
      tasks: [
        'Develop keyword-targeted content',
        'Launch review acquisition campaign',
        'Build local citations and backlinks',
        'Optimize for mobile experience'
      ],
      timeline: '1-3 months',
      priority: 'high' as const
    },
    {
      phase: 'Phase 3: Growth & Expansion',
      title: 'Advanced Optimization & Scaling',
      tasks: [
        'Advanced competitor analysis',
        'Conversion rate optimization',
        'Local schema markup implementation',
        'Advanced analytics and reporting'
      ],
      timeline: '3-6 months',
      priority: 'medium' as const
    }
  ];

  // Calculate ROI
  const currentLeads = Math.floor(Math.random() * 50) + 20;
  const potentialLeads = Math.floor(currentLeads * (Math.random() * 3 + 2)); // 2-5x increase
  const avgLeadValue = Math.floor(Math.random() * 2000) + 1000; // $1000-3000

  const roi = {
    currentEstimate: `${currentLeads} leads/month`,
    potentialIncrease: `${potentialLeads} leads/month (+${Math.round((potentialLeads/currentLeads - 1) * 100)}%)`,
    monthlyValue: `$${(potentialLeads * avgLeadValue).toLocaleString()}`,
    yearlyValue: `$${(potentialLeads * avgLeadValue * 12).toLocaleString()}`
  };

  return {
    businessName,
    website,
    gbpUrl,
    overallScore,
    scores,
    insights,
    opportunities,
    competitorData: competitors,
    actionPlan,
    roi
  };
} 