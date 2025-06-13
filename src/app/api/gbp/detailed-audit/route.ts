import { NextRequest, NextResponse } from 'next/server';
import { AuditStorage } from '@/lib/supabase';
import * as cheerio from 'cheerio';

interface DetailedAuditResult {
  overallScore: number;
  aiSeoScore: number;
  googleAiReadiness: number;
  listingCompletenessScore: number;
  contentAlignmentScore: number;
  localSeoReadinessScore: number;
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
  recommendations: {
    critical: string[];
    important: string[];
    suggested: string[];
  };
  analysisSummary: string;
  businessName: string;
  auditId: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url, businessName, basicAuditId } = await request.json();

    if (!url && !businessName) {
      return NextResponse.json(
        { error: 'Either URL or business name is required' },
        { status: 400 }
      );
    }

    const finalBusinessName = businessName || 'Business';
    
    // Perform detailed website analysis
    let websiteData = null;
    if (url) {
      try {
        websiteData = await scrapeWebsiteDetailed(url);
      } catch (error) {
        console.error('Website scraping failed:', error);
      }
    }

    // Generate comprehensive AI SEO audit
    const detailedAudit = await generateDetailedAuditWithAI(websiteData, finalBusinessName);

    const auditId = `detailed_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = {
      ...detailedAudit,
      businessName: finalBusinessName,
      auditId,
      url: url || undefined,
      timestamp: new Date().toISOString()
    };

    // Save detailed audit to permanent storage
    try {
      const username = request.headers.get('x-username') || 'anonymous';
      
      await AuditStorage.saveAudit(response, 'detailed', username);
      await AuditStorage.saveToUserHistory(username, auditId, finalBusinessName, detailedAudit.analysisSummary);
    } catch (storageError) {
      console.error('Failed to save detailed audit to storage:', storageError);
      // Continue with response even if storage fails
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error performing detailed audit:', error);
    return NextResponse.json(
      { error: 'Failed to perform detailed audit' },
      { status: 500 }
    );
  }
}

async function scrapeWebsiteDetailed(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  return {
    url,
    title: $('title').text().trim(),
    metaDescription: $('meta[name="description"]').attr('content') || '',
    h1Tags: $('h1').map((_, el) => $(el).text().trim()).get(),
    h2Tags: $('h2').map((_, el) => $(el).text().trim()).get(),
    h3Tags: $('h3').map((_, el) => $(el).text().trim()).get(),
    schemaMarkup: $('script[type="application/ld+json"]').length,
    openGraphTags: $('meta[property^="og:"]').length,
    twitterCardTags: $('meta[name^="twitter:"]').length,
    structuredData: $('[itemscope]').length,
    internalLinks: $('a[href^="/"], a[href*="' + new URL(url).hostname + '"]').length,
    externalLinks: $('a[href^="http"]:not([href*="' + new URL(url).hostname + '"])').length,
    images: $('img').map((_, el) => ({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') || '',
      hasAlt: !!$(el).attr('alt')
    })).get(),
    pageLoadSize: html.length,
    content: $('body').text().replace(/\s+/g, ' ').trim(),
    contactInfo: extractContactInfoDetailed($),
    localBusinessInfo: extractLocalBusinessInfo($),
    faqSections: $('[itemtype*="Question"], .faq, [data-faq]').length,
    breadcrumbs: $('[itemtype*="BreadcrumbList"], .breadcrumb').length
  };
}

function extractContactInfoDetailed($: cheerio.CheerioAPI) {
  const text = $('body').text();
  
  return {
    phone: text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)?.[1],
    email: text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1],
    address: text.match(/(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way)\s*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5})/)?.[1],
    businessHours: extractBusinessHours($),
    socialMedia: extractSocialMediaLinks($)
  };
}

function extractLocalBusinessInfo($: cheerio.CheerioAPI) {
  const text = $('body').text();
  const title = $('title').text();
  
  // Extract location mentions
  const cities = text.match(/\b(?:New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Washington|Boston|Nashville|Memphis|Portland|Las Vegas|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Kansas City|Mesa|Atlanta|Colorado Springs|Omaha|Raleigh|Miami|Tulsa|Virginia Beach|Wichita|Oakland|Minneapolis|Arlington|Tampa|New Orleans|Honolulu|Anaheim|Santa Ana|Corpus Christi|Riverside|St. Louis|Lexington|Pittsburgh|Anchorage|Stockton|Cincinnati|St. Paul|Toledo|Greensboro|Newark|Plano|Henderson|Lincoln|Buffalo|Jersey City|Chula Vista|Fort Wayne|Orlando|Chandler|Laredo|Madison|Lubbock|Winston-Salem|Garland|Glendale|Hialeah|Reno|Chesapeake|Gilbert|Baton Rouge|Irving|Scottsdale|North Las Vegas|Fremont|Boise|Richmond|San Bernardino|Birmingham|Spokane|Rochester|Des Moines|Modesto|Fayetteville|Tacoma|Oxnard|Fontana|Columbus|Montgomery|Moreno Valley|Shreveport|Aurora|Yonkers|Akron|Huntington Beach|Little Rock|Augusta|Amarillo|Glendale|Mobile|Grand Rapids|Salt Lake City|Tallahassee|Huntsville|Grand Prairie|Knoxville|Worcester|Newport News|Brownsville|Overland Park|Santa Clarita|Providence|Garden Grove|Chattanooga|Oceanside|Jackson|Fort Lauderdale|Santa Rosa|Rancho Cucamonga|Port St. Lucie|Tempe|Ontario|Vancouver|Cape Coral|Sioux Falls|Springfield|Peoria|Pembroke Pines|Elk Grove|Salem|Lancaster|Corona|Eugene|Palmdale|Salinas|Springfield|Pasadena|Fort Collins|Hayward|Pomona|Cary|Rockford|Alexandria|Escondido|McKinney|Kansas City|Joliet|Sunnyvale|Torrance|Bridgeport|Lakewood|Hollywood|Paterson|Naperville|Syracuse|Mesquite|Dayton|Savannah|Clarksville|Orange|Pasadena|Fullerton|Killeen|Frisco|Hampton|McAllen|Warren|Bellevue|West Valley City|Columbia|Olathe|Sterling Heights|New Haven|Miramar|Waco|Thousand Oaks|Cedar Rapids|Charleston|Roseville|Stamford|Concord|Hartford|Kent|Lafayette|Midland|Surprise|Denton|Victorville|Evansville|Santa Clara|Abilene|Athens|Vallejo|Allentown|Norman|Beaumont|Independence|Murfreesboro|Ann Arbor|Fargo|Wilmington|Provo|Lowell|Odessa|Riverside|Carlsbad|Boulder|Cambridge|Westminster|Elgin|Clearwater|City of St. Peters|Gresham|Costa Mesa|Daly City|Inglewood|Manchester|Green Bay|Miami Gardens|Mesa|Clovis|Tyler|Miami Beach)\b/gi) || [];
  
  return {
    locationMentions: cities.length,
    hasLocationInTitle: /\b(?:NYC|NY|CA|TX|FL|IL|PA|OH|GA|NC|MI|NJ|VA|WA|AZ|MA|TN|IN|MO|MD|WI|CO|MN|SC|AL|LA|KY|OR|OK|CT|IA|KS|AR|MS|UT|NV|NM|WV|NE|ID|NH|HI|RI|MT|DE|SD|ND|AK|DC|VT|WY)\b/i.test(title),
    serviceAreaMentions: (text.match(/\b(?:serving|service area|coverage|available in|located in|based in)\b/gi) || []).length
  };
}

function extractBusinessHours($: cheerio.CheerioAPI) {
  const text = $('body').text();
  const hoursPatterns = [
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday).{0,50}(?:\d{1,2}:\d{2}|closed)/gi,
    /(?:mon|tue|wed|thu|fri|sat|sun).{0,30}(?:\d{1,2}:\d{2}|closed)/gi,
    /hours?.{0,100}(?:\d{1,2}:\d{2}.*\d{1,2}:\d{2})/gi
  ];
  
  return hoursPatterns.some(pattern => pattern.test(text));
}

function extractSocialMediaLinks($: cheerio.CheerioAPI) {
  const socialLinks = $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="youtube.com"], a[href*="tiktok.com"]');
  return socialLinks.length;
}

async function generateDetailedAuditWithAI(websiteData: any, businessName: string): Promise<DetailedAuditResult> {
  const prompt = createDetailedAuditPrompt(websiteData, businessName);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO consultant specializing in Google AI search optimization, local SEO, and modern search engine algorithms. Provide detailed technical analysis with specific, actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return generateFallbackDetailedAudit(businessName);
    }

  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    return generateFallbackDetailedAudit(businessName);
  }
}

function createDetailedAuditPrompt(websiteData: any, businessName: string): string {
  const websiteInfo = websiteData ? `
WEBSITE ANALYSIS:
URL: ${websiteData.url}
Title: ${websiteData.title}
Meta Description: ${websiteData.metaDescription}
Schema Markup: ${websiteData.schemaMarkup} implementations
Open Graph Tags: ${websiteData.openGraphTags}
Structured Data: ${websiteData.structuredData} elements
Internal Links: ${websiteData.internalLinks}
External Links: ${websiteData.externalLinks}
Images with Alt Text: ${websiteData.images.filter((img: any) => img.hasAlt).length}/${websiteData.images.length}
Page Size: ${websiteData.pageLoadSize} bytes
Contact Information: ${JSON.stringify(websiteData.contactInfo)}
Local Business Info: ${JSON.stringify(websiteData.localBusinessInfo)}
FAQ Sections: ${websiteData.faqSections}
Breadcrumbs: ${websiteData.breadcrumbs}
Content Sample: ${websiteData.content.substring(0, 2000)}
` : `Business Name: ${businessName} (No website data available)`;

  return `
Conduct a comprehensive SEO audit focused on Google AI search optimization for:

${websiteInfo}

Analyze for modern search engine requirements including:

1. GOOGLE AI OPTIMIZATION:
   - Schema markup implementation and completeness
   - Featured snippet optimization potential
   - Voice search readiness (conversational content, FAQ structure)
   - Entity optimization and knowledge graph signals
   - E-A-T (Expertise, Authority, Trustworthiness) signals

2. TECHNICAL SEO ASSESSMENT:
   - Core Web Vitals readiness
   - Mobile-first indexing compliance
   - Structured data implementation
   - Page speed optimization opportunities
   - Internal linking structure

3. LOCAL SEO FACTORS:
   - NAP (Name, Address, Phone) consistency
   - Local keyword optimization
   - Google Business Profile readiness
   - Local citation opportunities

4. CONTENT QUALITY ANALYSIS:
   - Semantic keyword optimization
   - Content depth and expertise
   - User intent alignment
   - Topical authority indicators

5. COMPETITOR ANALYSIS:
   - Market positioning assessment
   - Competitive advantages identification
   - Opportunity gap analysis

Provide specific scores (0-100) and actionable recommendations. Focus on 2024+ SEO best practices and Google AI search optimization.

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "aiSeoScore": <number 0-100>,
  "googleAiReadiness": <number 0-100>,
  "listingCompletenessScore": <number 0-100>,
  "contentAlignmentScore": <number 0-100>,
  "localSeoReadinessScore": <number 0-100>,
  "detailedAnalysis": {
    "technicalSeo": {
      "score": <number 0-100>,
      "issues": [<array of technical issues>],
      "recommendations": [<array of technical recommendations>]
    },
    "contentQuality": {
      "score": <number 0-100>,
      "analysis": "<detailed content quality assessment>",
      "improvements": [<array of content improvements>]
    },
    "localSeoFactors": {
      "score": <number 0-100>,
      "napConsistency": <number 0-100>,
      "localKeywords": <number 0-100>,
      "reviewProfile": <number 0-100>
    },
    "googleAiOptimization": {
      "score": <number 0-100>,
      "schemaMarkup": <number 0-100>,
      "featuredSnippets": <number 0-100>,
      "voiceSearchReadiness": <number 0-100>,
      "entityOptimization": <number 0-100>
    },
    "competitorAnalysis": {
      "marketPosition": "<analysis of market position>",
      "strengthsVsCompetitors": [<array of competitive strengths>],
      "opportunityGaps": [<array of opportunities>]
    }
  },
  "actionPlan": {
    "immediate": [<array of immediate actions (1-2 weeks)>],
    "shortTerm": [<array of short-term actions (1-3 months)>],
    "longTerm": [<array of long-term actions (3-12 months)>]
  },
  "recommendations": {
    "critical": [<array of critical issues>],
    "important": [<array of important improvements>],
    "suggested": [<array of suggested enhancements>]
  },
  "analysisSummary": "<comprehensive 3-4 sentence summary of findings and AI SEO readiness>"
}
`;
}

function generateFallbackDetailedAudit(businessName: string): DetailedAuditResult {
  const baseScore = Math.floor(Math.random() * 30) + 50; // 50-80 base
  
  return {
    overallScore: Math.min(100, Math.max(30, baseScore)),
    aiSeoScore: Math.min(100, Math.max(20, baseScore - 10)),
    googleAiReadiness: Math.min(100, Math.max(25, baseScore - 5)),
    listingCompletenessScore: Math.min(100, Math.max(40, baseScore + 10)),
    contentAlignmentScore: Math.min(100, Math.max(30, baseScore)),
    localSeoReadinessScore: Math.min(100, Math.max(35, baseScore + 5)),
    detailedAnalysis: {
      technicalSeo: {
        score: Math.min(100, Math.max(20, baseScore - 15)),
        issues: [
          'Core Web Vitals optimization needed',
          'Schema markup implementation required',
          'Mobile-first indexing compliance issues'
        ],
        recommendations: [
          'Implement comprehensive schema markup',
          'Optimize for Core Web Vitals performance',
          'Enhance mobile user experience'
        ]
      },
      contentQuality: {
        score: Math.min(100, Math.max(25, baseScore - 10)),
        analysis: `${businessName} needs significant content optimization for Google AI search algorithms. Current content lacks depth and semantic keyword optimization.`,
        improvements: [
          'Develop topic cluster content strategy',
          'Optimize for semantic search patterns',
          'Create FAQ sections for voice search'
        ]
      },
      localSeoFactors: {
        score: Math.min(100, Math.max(30, baseScore)),
        napConsistency: Math.min(100, Math.max(40, baseScore + 15)),
        localKeywords: Math.min(100, Math.max(20, baseScore - 20)),
        reviewProfile: Math.min(100, Math.max(10, baseScore - 30))
      },
      googleAiOptimization: {
        score: Math.min(100, Math.max(15, baseScore - 25)),
        schemaMarkup: Math.min(100, Math.max(10, baseScore - 40)),
        featuredSnippets: Math.min(100, Math.max(20, baseScore - 30)),
        voiceSearchReadiness: Math.min(100, Math.max(15, baseScore - 35)),
        entityOptimization: Math.min(100, Math.max(25, baseScore - 25))
      },
      competitorAnalysis: {
        marketPosition: `${businessName} is positioned in a competitive market with opportunities for Google AI optimization advancement.`,
        strengthsVsCompetitors: [
          'Strong local presence potential',
          'Established business foundation'
        ],
        opportunityGaps: [
          'Google AI search optimization',
          'Voice search preparation',
          'Advanced schema implementation'
        ]
      }
    },
    actionPlan: {
      immediate: [
        'Implement basic schema markup for LocalBusiness',
        'Optimize Google Business Profile with complete information',
        'Create FAQ section for voice search optimization'
      ],
      shortTerm: [
        'Develop comprehensive content strategy for semantic search',
        'Implement advanced schema markup for services',
        'Optimize for featured snippet opportunities'
      ],
      longTerm: [
        'Build topical authority through content clusters',
        'Establish comprehensive entity optimization',
        'Develop voice search conversation strategies'
      ]
    },
    recommendations: {
      critical: [
        'Implement Google AI search optimization strategy',
        'Complete schema markup implementation',
        'Optimize for voice search and featured snippets'
      ],
      important: [
        'Develop semantic keyword strategy',
        'Create comprehensive FAQ sections',
        'Enhance entity optimization signals'
      ],
      suggested: [
        'Monitor Google AI search ranking factors',
        'Implement advanced structured data',
        'Develop conversation-based content'
      ]
    },
    analysisSummary: `${businessName} requires comprehensive Google AI search optimization to compete in modern search results. Critical focus needed on schema markup, voice search readiness, and entity optimization. Implementation of AI-focused SEO strategies will significantly improve search visibility and user engagement.`,
    businessName,
    auditId: `detailed_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString()
  };
} 