import { NextRequest, NextResponse } from 'next/server';

interface CampaignContact {
  [key: string]: string;
}

// Common Apollo field mappings to standardized variables
const FIELD_MAPPINGS: { [key: string]: string[] } = {
  'name': ['name', 'first_name', 'full_name', 'contact_name', 'person_name'],
  'first_name': ['first_name', 'firstname', 'fname'],
  'last_name': ['last_name', 'lastname', 'lname'],
  'company': ['company', 'company_name', 'organization', 'business_name', 'account_name'],
  'title': ['title', 'job_title', 'position', 'role'],
  'phone': ['phone', 'mobile_phone', 'cell_phone', 'phone_number', 'mobile', 'cell'],
  'email': ['email', 'email_address', 'work_email', 'business_email'],
  'website': ['website', 'company_website', 'domain', 'website_url'],
  'location': ['location', 'city', 'state', 'country', 'address'],
  'industry': ['industry', 'industry_type', 'sector'],
  'employees': ['employees', 'company_size', 'employee_count', 'num_employees'],
  'revenue': ['revenue', 'annual_revenue', 'company_revenue'],
  'linkedin': ['linkedin', 'linkedin_url', 'person_linkedin_url'],
  'company_linkedin': ['company_linkedin', 'company_linkedin_url'],
  'facebook': ['facebook', 'facebook_url'],
  'twitter': ['twitter', 'twitter_url'],
  'technologies': ['technologies', 'tech_stack', 'software_used'],
  'keywords': ['keywords', 'tags', 'interests'],
  'source': ['source', 'lead_source', 'data_source'],
  'confidence': ['confidence', 'accuracy_score', 'data_quality'],
};

function parseCSV(csvText: string): CampaignContact[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const contacts: CampaignContact[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length >= headers.length) {
      const contact: CampaignContact = {};
      headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().replace(/\s+/g, '_');
        contact[cleanHeader] = values[index] || '';
      });
      contacts.push(contact);
    }
  }
  
  return contacts;
}

function standardizeFields(contacts: CampaignContact[]): CampaignContact[] {
  return contacts.map(contact => {
    const standardized: CampaignContact = { ...contact };
    
    // Map fields to standard names
    Object.entries(FIELD_MAPPINGS).forEach(([standardName, variants]) => {
      if (!standardized[standardName]) {
        for (const variant of variants) {
          if (contact[variant]) {
            standardized[standardName] = contact[variant];
            break;
          }
        }
      }
    });
    
    // Clean phone numbers
    if (standardized.phone) {
      const cleaned = standardized.phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        standardized.phone = `+1${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        standardized.phone = `+${cleaned}`;
      }
    }
    
    // Ensure required fields exist
    if (!standardized.name && standardized.first_name) {
      standardized.name = standardized.first_name + (standardized.last_name ? ` ${standardized.last_name}` : '');
    }
    
    // Add current date/time variables
    const now = new Date();
    standardized.current_date = now.toLocaleDateString();
    standardized.current_time = now.toLocaleTimeString();
    standardized.current_month = now.toLocaleString('default', { month: 'long' });
    standardized.current_year = now.getFullYear().toString();
    
    return standardized;
  });
}

function generateDripCampaignCSV(contacts: CampaignContact[]): string {
  if (contacts.length === 0) return '';
  
  // PRESERVE ALL FIELDS - reliable processing with full data intact
  // Required headers for drip campaign
  const requiredHeaders = ['name', 'phone', 'company', 'email'];
  const allHeaders = new Set<string>();
  
  // Collect all unique headers
  contacts.forEach(contact => {
    Object.keys(contact).forEach(key => allHeaders.add(key));
  });
  
  // Prioritize required headers first, then add others
  const sortedHeaders = [
    ...requiredHeaders.filter(h => allHeaders.has(h)),
    ...Array.from(allHeaders).filter(h => !requiredHeaders.includes(h)).sort()
  ];
  
  const csvContent = [
    sortedHeaders.join(','),
    ...contacts.map(contact => 
      sortedHeaders.map(header => {
        const value = contact[header] || '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        const escaped = stringValue.replace(/"/g, '""');
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

function getAvailableVariables(contacts: CampaignContact[]): string[] {
  const allVariables = new Set<string>();
  
  contacts.forEach(contact => {
    Object.keys(contact).forEach(key => {
      if (contact[key] && contact[key].trim()) {
        allVariables.add(key);
      }
    });
  });
  
  return Array.from(allVariables).sort();
}

function generateSampleMessage(variables: string[]): string {
  const samples = [
    "Hi {name}! I noticed {company} could benefit from better online visibility. We've helped similar {industry} businesses increase leads by 300%. Quick 15-minute call this {current_month}?",
    
    "Hey {name}, saw {company} on LinkedIn. Most {industry} companies in {location} are missing out on digital leads. We just helped a competitor get 50+ new customers/month. Interested in how?",
    
    "Hi {name}! True Rank Digital here. {company} has great potential but your online presence could be stronger. We've helped {industry} businesses like yours dominate local search. 10-minute call?",
    
    "{name}, quick question about {company}'s marketing. Are you getting enough quality leads right now? We specialize in {industry} and typically 3x our clients' lead flow in 90 days.",
    
    "Hey {name}! Noticed {company} could capture more market share online. We help {industry} businesses outrank competitors and get consistent leads. Worth a quick chat about {company}'s growth goals?"
  ];
  
  return samples[Math.floor(Math.random() * samples.length)];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const campaignName = formData.get('campaignName') as string || 'Apollo Import Campaign';
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const csvText = await file.text();
    const rawContacts = parseCSV(csvText);
    
    if (rawContacts.length === 0) {
      return NextResponse.json({ error: 'No valid data found in CSV' }, { status: 400 });
    }
    
    // Standardize and clean the data
    const standardizedContacts = standardizeFields(rawContacts);
    
    // Filter out contacts without phone numbers
    const validContacts = standardizedContacts.filter(contact => 
      contact.phone && contact.phone.trim()
    );
    
    if (validContacts.length === 0) {
      return NextResponse.json({ error: 'No contacts with valid phone numbers found' }, { status: 400 });
    }
    
    // Generate campaign-ready CSV
    const campaignCSV = generateDripCampaignCSV(validContacts);
    
    // Get all available variables
    const availableVariables = getAvailableVariables(validContacts);
    
    // Generate sample messages
    const sampleMessages = [
      generateSampleMessage(availableVariables),
      generateSampleMessage(availableVariables),
      generateSampleMessage(availableVariables)
    ];
    
    const stats = {
      total_input: rawContacts.length,
      valid_contacts: validContacts.length,
      with_phone: validContacts.filter(c => c.phone).length,
      with_email: validContacts.filter(c => c.email).length,
      with_company: validContacts.filter(c => c.company).length,
      variables_available: availableVariables.length,
      excluded_no_phone: rawContacts.length - validContacts.length
    };
    
    return NextResponse.json({
      success: true,
      campaignName,
      stats,
      csvData: campaignCSV,
      filename: `${campaignName.toLowerCase().replace(/\s+/g, '_')}_campaign.csv`,
      availableVariables,
      sampleMessages,
      fieldMappings: FIELD_MAPPINGS
    });
    
  } catch (error: any) {
    console.error('Error formatting campaign:', error);
    return NextResponse.json({
      error: 'Failed to format campaign: ' + error.message
    }, { status: 500 });
  }
} 