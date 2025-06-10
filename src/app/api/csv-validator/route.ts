import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  fixedData?: FormattedLead[];
  originalData?: LeadData[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicatePhones: number;
    mobileNumbers: number;
    landlines: number;
    emailsFound: number;
    companiesFound: number;
    namesFound: number;
    availableVariables: string[];
  };
}

interface FormattedLead {
  // Standard fields for messaging
  name: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  phone_type: 'mobile' | 'landline' | 'voip' | 'unknown';
  email: string;
  title: string;
  city: string;
  state: string;
  country: string;
  industry: string;
  website: string;
  sms_eligible: boolean;
  
  // Additional fields for personalization
  location: string;
  revenue: string;
  employees: string;
  linkedin_url: string;
  
  // Raw original data for custom variables
  original_data: { [key: string]: string };
}

// Enhanced field mappings based on the proven campaign formatter
const FIELD_MAPPINGS = {
  name: ['name', 'first_name', 'full_name', 'contact_name', 'person_name', 'lead_name'],
  first_name: ['first_name', 'firstname', 'fname', 'given_name'],
  last_name: ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
  company: ['company', 'company_name', 'organization', 'business_name', 'account_name', 'business', 'firm'],
  phone: ['phone', 'mobile_phone', 'cell_phone', 'phone_number', 'mobile', 'cell', 'telephone', 'work_direct_phone'],
  email: ['email', 'email_address', 'work_email', 'business_email', 'e-mail', 'mail', 'primary_email'],
  title: ['title', 'job_title', 'position', 'role', 'designation'],
  city: ['city', 'location_city', 'town'],
  state: ['state', 'province', 'region', 'location_state'],
  country: ['country', 'nation', 'location_country'],
  industry: ['industry', 'industry_type', 'sector', 'business_type', 'vertical'],
  website: ['website', 'company_website', 'domain', 'website_url', 'url', 'web', 'site'],
  employees: ['employees', 'company_size', 'employee_count', 'num_employees', '# employees', 'team_size', 'staff_count'],
  revenue: ['revenue', 'annual_revenue', 'company_revenue', 'annual revenue', 'income', 'turnover'],
  linkedin_url: ['linkedin', 'linkedin_url', 'person_linkedin_url', 'linkedin_profile'],
  location: ['location', 'address', 'full_address'],
  technologies: ['technologies', 'tech_stack', 'software_used'],
  keywords: ['keywords', 'tags', 'interests'],
  source: ['source', 'lead_source', 'data_source'],
  confidence: ['confidence', 'accuracy_score', 'data_quality']
};

// Phone number validation and classification
function detectPhoneType(phone: string): 'mobile' | 'landline' | 'voip' | 'unknown' {
  if (!phone) return 'unknown';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return 'unknown';
  
  const areaCode = cleaned.substring(0, 3);
  
  // VoIP/Toll-free numbers
  const voipAreaCodes = ['800', '844', '855', '866', '877', '888'];
  if (voipAreaCodes.includes(areaCode)) return 'voip';
  
  // Known business/landline patterns
  if (areaCode.startsWith('555')) return 'landline';
  
  // Most US area codes can be mobile - we'll assume mobile for SMS eligibility
  return 'mobile';
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  } else if (cleaned.length > 11) {
    // International number
    return `+${cleaned}`;
  }
  return phone;
}

// Improved CSV parsing using the proven campaign formatter logic
function parseCSV(csvText: string): LeadData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Parse headers - simple approach that works better
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const contacts: LeadData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    // More lenient - just need most of the headers to match
    if (values.length >= headers.length) {
      const contact: LeadData = {};
      headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().replace(/\s+/g, '_');
        contact[cleanHeader] = values[index] || '';
      });
      contacts.push(contact);
    }
  }
  
  return contacts;
}

function findBestFieldMatch(availableFields: string[], targetField: string): string | null {
  const possibleMatches = FIELD_MAPPINGS[targetField as keyof typeof FIELD_MAPPINGS] || [];
  
  for (const possible of possibleMatches) {
    const match = availableFields.find(field => 
      field.toLowerCase().includes(possible.toLowerCase()) ||
      possible.toLowerCase().includes(field.toLowerCase())
    );
    if (match) return match;
  }
  
  return null;
}

// Improved standardization using campaign formatter logic
function standardizeFields(contacts: LeadData[]): FormattedLead[] {
  return contacts.map(contact => {
    const standardized: any = { ...contact };
    
    // Map fields to standard names using proven logic
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
    
    // Clean phone numbers using campaign formatter logic
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
    
    // If no first/last but have full name, try to split
    if (!standardized.first_name && !standardized.last_name && standardized.name) {
      const nameParts = standardized.name.split(' ');
      standardized.first_name = nameParts[0] || '';
      standardized.last_name = nameParts.slice(1).join(' ') || '';
    }
    
    // Create location string
    const locationParts = [standardized.city, standardized.state, standardized.country].filter(part => part);
    if (!standardized.location) {
      standardized.location = locationParts.join(', ');
    }
    
    const phoneType = detectPhoneType(standardized.phone);
    
    // Create formatted lead
    const formattedLead: FormattedLead = {
      name: standardized.name || '',
      first_name: standardized.first_name || '',
      last_name: standardized.last_name || '',
      company: standardized.company || '',
      phone: standardized.phone || '',
      phone_type: phoneType,
      email: standardized.email || '',
      title: standardized.title || '',
      city: standardized.city || '',
      state: standardized.state || '',
      country: standardized.country || '',
      industry: standardized.industry || '',
      website: standardized.website || '',
      sms_eligible: phoneType === 'mobile',
      location: standardized.location || '',
      revenue: standardized.revenue || '',
      employees: standardized.employees || '',
      linkedin_url: standardized.linkedin_url || '',
      original_data: { ...contact }
    };
    
    return formattedLead;
  });
}

function validateAndFormatLeads(leads: LeadData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (leads.length === 0) {
    errors.push('No data found in CSV file');
    return {
      isValid: false,
      errors,
      warnings,
      suggestions,
      stats: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        duplicatePhones: 0,
        mobileNumbers: 0,
        landlines: 0,
        emailsFound: 0,
        companiesFound: 0,
        namesFound: 0,
        availableVariables: []
      }
    };
  }
  
  // Standardize using proven logic
  const formattedLeads = standardizeFields(leads);
  
  // Get available field names from original data
  const availableFields = Object.keys(leads[0]);
  const fieldMappings: { [key: string]: string | null } = {};
  
  // Map standard fields
  Object.keys(FIELD_MAPPINGS).forEach(targetField => {
    fieldMappings[targetField] = findBestFieldMatch(availableFields, targetField);
  });
  
  // Check for required fields
  if (!fieldMappings.phone) {
    errors.push('No phone number column found. Required for SMS messaging.');
    suggestions.push('Add a column with phone numbers (phone, mobile, cell, etc.)');
  }
  
  if (!fieldMappings.name && !fieldMappings.first_name) {
    warnings.push('No name column found. Personalization will be limited.');
    suggestions.push('Add a name column for better personalization');
  }
  
  let validRows = 0;
  let mobileCount = 0;
  let landlineCount = 0;
  let emailCount = 0;
  let companyCount = 0;
  let nameCount = 0;
  const phonesSeen = new Set<string>();
  let duplicatePhones = 0;
  
  // Process each lead using simpler validation like campaign formatter
  formattedLeads.forEach((lead, index) => {
    const rowNumber = index + 2; // +2 for header row and 0-based index
    
    if (!lead.phone) {
      warnings.push(`Row ${rowNumber}: No phone number found`);
    } else if (phonesSeen.has(lead.phone)) {
      duplicatePhones++;
      warnings.push(`Row ${rowNumber}: Duplicate phone number ${lead.phone}`);
    } else {
      phonesSeen.add(lead.phone);
    }
    
    // Count phone types
    if (lead.phone_type === 'mobile') mobileCount++;
    else if (lead.phone_type === 'landline') landlineCount++;
    
    if (lead.email) emailCount++;
    if (lead.company) companyCount++;
    if (lead.name) nameCount++;
    
    // Simple validation - has phone and some identity
    const hasValidPhone = lead.phone && lead.phone_type !== 'unknown';
    const hasIdentity = lead.name || lead.first_name || lead.company;
    
    if (hasValidPhone && hasIdentity) {
      validRows++;
    }
  });
  
  // Generate availability analysis using campaign formatter approach
  const availableVariables: string[] = [];
  
  // Check which variables have data in a significant number of records
  const threshold = Math.max(1, Math.floor(leads.length * 0.1)); // At least 10% of records
  
     Object.keys(FIELD_MAPPINGS).forEach(field => {
     const count = formattedLeads.filter(lead => {
       const value = lead[field as keyof FormattedLead];
       return value && typeof value === 'string' && value.trim().length > 0;
     }).length;
    
    if (count >= threshold) {
      availableVariables.push(field);
    }
  });
  
  // Always available system variables
  availableVariables.push('current_date', 'current_time', 'current_month', 'current_year');
  
  // Analysis and suggestions
  if (mobileCount === 0) {
    errors.push('No mobile phone numbers found. SMS campaigns require mobile numbers.');
  } else if (mobileCount < leads.length * 0.5) {
    warnings.push(`Only ${mobileCount} out of ${leads.length} leads have mobile numbers. Consider filtering for mobile-only.`);
  }
  
  if (duplicatePhones > 0) {
    warnings.push(`${duplicatePhones} duplicate phone numbers found. These will be removed automatically.`);
  }
  
  if (companyCount < leads.length * 0.7) {
    suggestions.push('Adding company information would improve personalization options.');
  }
  
  if (emailCount < leads.length * 0.5) {
    suggestions.push('Email addresses would enable multi-channel campaigns.');
  }
  
  // Final validation
  const isValid = errors.length === 0 && validRows > 0;
  
  const stats = {
    totalRows: leads.length,
    validRows,
    invalidRows: leads.length - validRows,
    duplicatePhones,
    mobileNumbers: mobileCount,
    landlines: landlineCount,
    emailsFound: emailCount,
    companiesFound: companyCount,
    namesFound: nameCount,
    availableVariables: [...new Set(availableVariables)]
  };
  
  return {
    isValid,
    errors,
    warnings,
    suggestions,
    fixedData: formattedLeads,
    originalData: leads,
    stats
  };
}

function generateCleanedCSV(leads: FormattedLead[]): string {
  if (leads.length === 0) return '';
  
  // Standard headers for SMS campaigns
  const headers = [
    'name',
    'first_name', 
    'last_name',
    'company',
    'phone',
    'phone_type',
    'email',
    'title',
    'city',
    'state',
    'country',
    'location',
    'industry',
    'website',
    'revenue',
    'employees',
    'linkedin_url',
    'sms_eligible'
  ];
  
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => 
      headers.map(header => {
        const value = lead[header as keyof FormattedLead];
        const stringValue = typeof value === 'boolean' ? value.toString() : (value || '');
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const validationMode = formData.get('mode') as string || 'validate'; // 'validate' or 'fix'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV file' }, { status: 400 });
    }
    
    const csvText = await file.text();
    if (!csvText.trim()) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }
    
    const leads = parseCSV(csvText);
    const validation = validateAndFormatLeads(leads);
    
    if (validationMode === 'fix' && validation.fixedData) {
      // Remove duplicates and filter mobile-only
      const uniqueLeads = validation.fixedData.filter((lead, index, self) => 
        index === self.findIndex(l => l.phone === lead.phone)
      );
      
      const mobileOnlyLeads = uniqueLeads.filter(lead => lead.sms_eligible);
      
      const cleanedCSV = generateCleanedCSV(mobileOnlyLeads);
      
      return NextResponse.json({
        success: true,
        action: 'fixed',
        validation,
        cleanedCSV,
        fileName: `cleaned_${file.name}`,
        summary: {
          originalCount: leads.length,
          afterCleaning: mobileOnlyLeads.length,
          removed: leads.length - mobileOnlyLeads.length,
          duplicatesRemoved: uniqueLeads.length - mobileOnlyLeads.length,
          readyForCampaign: true
        }
      });
    } else {
      // Just validate
      return NextResponse.json({
        success: validation.isValid,
        action: 'validated',
        validation,
        readyForCampaign: validation.isValid && validation.stats.mobileNumbers > 0
      });
    }
    
  } catch (error: any) {
    console.error('Error validating CSV:', error);
    return NextResponse.json({
      error: 'Failed to process CSV: ' + error.message
    }, { status: 500 });
  }
} 