import { NextRequest, NextResponse } from 'next/server';

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    periods: any[];
    weekday_text: string[];
  };
  photos?: any[];
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  business_status?: string;
  price_level?: number;
}

interface AuditResult {
  businessName: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  totalReviews: number;
  isOpen?: boolean;
  hasPhotos: boolean;
  photoCount: number;
  categories: string[];
  overallScore: number;
  auditDetails: {
    profileCompleteness: number;
    reviewManagement: number;
    photoOptimization: number;
    informationAccuracy: number;
    localSEO: number;
  };
  recommendations: string[];
  competitorInsights: string[];
  actionItems: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { gbpUrl, businessName, additionalInfo } = await request.json();
    
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    let placeId: string | null = null;
    let searchQuery = '';

    // Extract place ID from Google Maps URL
    if (gbpUrl && gbpUrl.includes('google.com/maps')) {
      const placeIdMatch = gbpUrl.match(/place\/([^\/]+)/);
      if (placeIdMatch) {
        // Decode the place name and use it for search
        searchQuery = decodeURIComponent(placeIdMatch[1].replace(/\+/g, ' '));
      }
      
      // Try to extract place_id if it exists in URL
      const directPlaceIdMatch = gbpUrl.match(/place_id:([A-Za-z0-9_-]+)/);
      if (directPlaceIdMatch) {
        placeId = directPlaceIdMatch[1];
      }
    } else if (businessName) {
      searchQuery = businessName;
    }

    // If we don't have a direct place_id, search for the business
    if (!placeId && searchQuery) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.status === 'OK' && searchData.results.length > 0) {
        placeId = searchData.results[0].place_id;
      } else {
        return NextResponse.json(
          { error: `Business not found: ${searchQuery}. Status: ${searchData.status}` },
          { status: 404 }
        );
      }
    }

    if (!placeId) {
      return NextResponse.json(
        { error: 'Could not determine place ID from the provided information' },
        { status: 400 }
      );
    }

    // Get detailed place information
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos,types,geometry,business_status,price_level&key=${GOOGLE_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK') {
      return NextResponse.json(
        { error: `Failed to fetch business details. Status: ${detailsData.status}` },
        { status: 400 }
      );
    }

    const place: GooglePlaceDetails = detailsData.result;
    
    // Perform audit analysis
    const auditResult = performGBPAudit(place);
    
    // Generate comprehensive visual report
    const visualReport = generateVisualAuditReport(auditResult, place);

    return NextResponse.json({
      businessName: place.name,
      placeId: place.place_id,
      auditResult,
      visualReport,
      rawData: {
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        totalReviews: place.user_ratings_total,
        categories: place.types,
        location: place.geometry.location
      }
    });

  } catch (error) {
    console.error('Error in GBP audit:', error);
    return NextResponse.json(
      { error: 'Failed to perform GBP audit' },
      { status: 500 }
    );
  }
}

function performGBPAudit(place: GooglePlaceDetails): AuditResult {
  // Calculate profile completeness score
  let completenessScore = 0;
  const maxCompleteness = 10;
  
  if (place.name) completenessScore += 2;
  if (place.formatted_address) completenessScore += 1;
  if (place.formatted_phone_number) completenessScore += 2;
  if (place.website) completenessScore += 2;
  if (place.opening_hours) completenessScore += 2;
  if (place.photos && place.photos.length > 0) completenessScore += 1;
  
  const profileCompleteness = Math.round((completenessScore / maxCompleteness) * 100);

  // Review management score
  const rating = place.rating || 0;
  const totalReviews = place.user_ratings_total || 0;
  let reviewScore = 0;
  
  if (rating >= 4.5) reviewScore += 40;
  else if (rating >= 4.0) reviewScore += 30;
  else if (rating >= 3.5) reviewScore += 20;
  else if (rating >= 3.0) reviewScore += 10;
  
  if (totalReviews >= 100) reviewScore += 30;
  else if (totalReviews >= 50) reviewScore += 25;
  else if (totalReviews >= 25) reviewScore += 20;
  else if (totalReviews >= 10) reviewScore += 15;
  else if (totalReviews >= 5) reviewScore += 10;
  
  if (totalReviews > 0) reviewScore += 30; // Has reviews at all
  
  const reviewManagement = Math.min(reviewScore, 100);

  // Photo optimization score
  const photoCount = place.photos?.length || 0;
  let photoScore = 0;
  
  if (photoCount >= 20) photoScore = 100;
  else if (photoCount >= 15) photoScore = 80;
  else if (photoCount >= 10) photoScore = 60;
  else if (photoCount >= 5) photoScore = 40;
  else if (photoCount >= 1) photoScore = 20;
  
  const photoOptimization = photoScore;

  // Information accuracy score (based on completeness)
  let infoScore = 0;
  if (place.business_status === 'OPERATIONAL') infoScore += 25;
  if (place.formatted_phone_number) infoScore += 25;
  if (place.website) infoScore += 25;
  if (place.opening_hours) infoScore += 25;
  
  const informationAccuracy = infoScore;

  // Local SEO score
  let localSEOScore = 0;
  if (place.types && place.types.length > 0) localSEOScore += 20;
  if (rating && rating > 4.0) localSEOScore += 30;
  if (totalReviews > 20) localSEOScore += 25;
  if (photoCount > 5) localSEOScore += 25;
  
  const localSEO = Math.min(localSEOScore, 100);

  // Calculate overall score
  const overallScore = Math.round(
    (profileCompleteness + reviewManagement + photoOptimization + informationAccuracy + localSEO) / 5
  );

  // Generate recommendations
  const recommendations = [];
  if (profileCompleteness < 80) {
    recommendations.push("Complete missing business information fields");
  }
  if (photoCount < 10) {
    recommendations.push("Add more high-quality business photos");
  }
  if (rating < 4.0) {
    recommendations.push("Implement review management strategy to improve rating");
  }
  if (totalReviews < 25) {
    recommendations.push("Encourage more customer reviews");
  }
  if (!place.website) {
    recommendations.push("Add or update business website URL");
  }
  if (!place.opening_hours) {
    recommendations.push("Add accurate business hours");
  }

  return {
    businessName: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    website: place.website,
    rating: place.rating || 0,
    totalReviews: place.user_ratings_total || 0,
    isOpen: place.opening_hours?.open_now,
    hasPhotos: photoCount > 0,
    photoCount,
    categories: place.types || [],
    overallScore,
    auditDetails: {
      profileCompleteness,
      reviewManagement,
      photoOptimization,
      informationAccuracy,
      localSEO
    },
    recommendations,
    competitorInsights: [
      "Businesses with 4.5+ stars get 2x more calls",
      "Complete profiles get 70% more visibility",
      "Regular photo updates improve engagement by 42%"
    ],
    actionItems: [
      "Respond to all recent reviews",
      "Upload 3-5 new photos monthly",
      "Optimize business description with keywords",
      "Post weekly updates to Google Business Profile"
    ]
  };
}

function generateVisualAuditReport(audit: AuditResult, place: GooglePlaceDetails): string {
  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🟢 EXCELLENT';
    if (score >= 75) return '🟡 GOOD';
    if (score >= 60) return '🟠 NEEDS WORK';
    return '🔴 CRITICAL';
  };

  const getStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  return `
🏢 **GOOGLE BUSINESS PROFILE AUDIT**
🎯 **TRUE RANK DIGITAL - Live GBP Analysis**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **BUSINESS OVERVIEW**
🏢 Name: ${audit.businessName}
📍 Address: ${audit.address}
📞 Phone: ${audit.phone || 'Not listed'}
🌐 Website: ${audit.website || 'Not provided'}
${getStars(audit.rating)} ${audit.rating}/5.0 (${audit.totalReviews} reviews)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 **OVERALL GBP SCORE: ${audit.overallScore}/100**
${getScoreEmoji(audit.overallScore)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 **DETAILED AUDIT BREAKDOWN:**

📝 Profile Completeness: ${audit.auditDetails.profileCompleteness}/100 ${getScoreEmoji(audit.auditDetails.profileCompleteness)}
⭐ Review Management: ${audit.auditDetails.reviewManagement}/100 ${getScoreEmoji(audit.auditDetails.reviewManagement)}
📸 Photo Optimization: ${audit.auditDetails.photoOptimization}/100 ${getScoreEmoji(audit.auditDetails.photoOptimization)}
✅ Information Accuracy: ${audit.auditDetails.informationAccuracy}/100 ${getScoreEmoji(audit.auditDetails.informationAccuracy)}
🔍 Local SEO Strength: ${audit.auditDetails.localSEO}/100 ${getScoreEmoji(audit.auditDetails.localSEO)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **KEY METRICS:**
• Photo Count: ${audit.photoCount} ${audit.photoCount >= 10 ? '✅' : '❌ (Need 10+)'}
• Business Categories: ${audit.categories.slice(0, 3).join(', ')}
• Current Status: ${place.business_status === 'OPERATIONAL' ? '✅ Operational' : '❌ Needs Update'}
• Hours Listed: ${audit.isOpen !== undefined ? '✅ Yes' : '❌ Missing'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **PRIORITY RECOMMENDATIONS:**

${audit.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 **COMPETITOR INSIGHTS:**

${audit.competitorInsights.map((insight, index) => `• ${insight}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **IMMEDIATE ACTION ITEMS:**

${audit.actionItems.map((item, index) => `${index + 1}. ${item}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 **ROI OPPORTUNITY:**
• Optimizing this profile could increase calls by 40-70%
• Businesses with complete profiles get 2x more website visits
• Improved ratings lead to 25% more customer actions

📞 **NEXT STEPS WITH TRUE RANK DIGITAL:**
1. 🎯 Complete profile optimization within 48 hours
2. 📊 Implement review acquisition strategy
3. 🚀 Launch local SEO campaign for maximum visibility
4. 📈 Track and measure performance improvements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Contact: hello@truerankdigital.com
📞 Ready to transform your Google Business Profile
🌐 www.truerankdigital.com

**Live Audit Generated:** ${new Date().toLocaleString()}
**Powered by:** True Rank Digital + Google Maps API
  `.trim();
} 