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

// Mapping rules for common CSV column variations
const FIELD_MAPPINGS = {
  name: ['name', 'full_name', 'contact_name', 'lead_name', 'person_name'],
  first_name: ['first_name', 'first name', 'fname', 'given_name', 'firstname'],
  last_name: ['last_name', 'last name', 'lname', 'surname', 'lastname', 'family_name'],
  company: ['company', 'company_name', 'company name', 'organization', 'business', 'firm'],
  phone: ['phone', 'phone_number', 'mobile', 'cell', 'telephone', 'phone number', 'mobile phone', 'work direct phone', 'mobile phone'],
  email: ['email', 'email_address', 'e-mail', 'mail', 'email address', 'primary email'],
  title: ['title', 'job_title', 'position', 'role', 'designation'],
  city: ['city', 'location_city', 'town'],
  state: ['state', 'province', 'region', 'location_state'],
  country: ['country', 'nation', 'location_country'],
  industry: ['industry', 'sector', 'business_type', 'vertical'],
  website: ['website', 'url', 'company_website', 'web', 'site'],
  employees: ['employees', '# employees', 'company_size', 'team_size', 'staff_count'],
  revenue: ['revenue', 'annual_revenue', 'annual revenue', 'income', 'turnover'],
  linkedin_url: ['linkedin_url', 'linkedin', 'person linkedin url', 'linkedin profile']
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

function parseCSV(csvText: string): LeadData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Parse headers - handle quoted values
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  
  const leads: LeadData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    if (values.length >= headers.length - 2) { // Allow some flexibility
      const lead: LeadData = {};
      headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        lead[cleanHeader] = values[index] || '';
      });
      leads.push(lead);
    }
  }
  
  return leads;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  values.push(current.trim());
  
  return values;
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

function validateAndFormatLeads(leads: LeadData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const formattedLeads: FormattedLead[] = [];
  
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
  
  // Get available field names
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
  
  // Process each lead
  leads.forEach((lead, index) => {
    const rowNumber = index + 2; // +2 for header row and 0-based index
    
    // Extract phone number
    const phoneField = fieldMappings.phone;
    const rawPhone = phoneField ? lead[phoneField] : '';
    const formattedPhone = rawPhone ? formatPhoneNumber(rawPhone) : '';
    const phoneType = detectPhoneType(formattedPhone);
    
    if (!formattedPhone) {
      warnings.push(`Row ${rowNumber}: No phone number found`);
    } else if (phonesSeen.has(formattedPhone)) {
      duplicatePhones++;
      warnings.push(`Row ${rowNumber}: Duplicate phone number ${formattedPhone}`);
    } else {
      phonesSeen.add(formattedPhone);
    }
    
    // Count phone types
    if (phoneType === 'mobile') mobileCount++;
    else if (phoneType === 'landline') landlineCount++;
    
    // Extract name
    let name = '';
    let firstName = '';
    let lastName = '';
    
    if (fieldMappings.name) {
      name = lead[fieldMappings.name] || '';
    }
    
    if (fieldMappings.first_name) {
      firstName = lead[fieldMappings.first_name] || '';
    }
    
    if (fieldMappings.last_name) {
      lastName = lead[fieldMappings.last_name] || '';
    }
    
    // If no full name but have first/last, combine them
    if (!name && (firstName || lastName)) {
      name = `${firstName} ${lastName}`.trim();
    }
    
    // If no first/last but have full name, try to split
    if (!firstName && !lastName && name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    if (name) nameCount++;
    
    // Extract other fields
    const company = fieldMappings.company ? lead[fieldMappings.company] || '' : '';
    const email = fieldMappings.email ? lead[fieldMappings.email] || '' : '';
    const title = fieldMappings.title ? lead[fieldMappings.title] || '' : '';
    const city = fieldMappings.city ? lead[fieldMappings.city] || '' : '';
    const state = fieldMappings.state ? lead[fieldMappings.state] || '' : '';
    const country = fieldMappings.country ? lead[fieldMappings.country] || '' : '';
    const industry = fieldMappings.industry ? lead[fieldMappings.industry] || '' : '';
    const website = fieldMappings.website ? lead[fieldMappings.website] || '' : '';
    const employees = fieldMappings.employees ? lead[fieldMappings.employees] || '' : '';
    const revenue = fieldMappings.revenue ? lead[fieldMappings.revenue] || '' : '';
    const linkedinUrl = fieldMappings.linkedin_url ? lead[fieldMappings.linkedin_url] || '' : '';
    
    if (email) emailCount++;
    if (company) companyCount++;
    
    // Create location string
    const locationParts = [city, state, country].filter(part => part);
    const location = locationParts.join(', ');
    
    // Check if this row has minimum required data
    const hasValidPhone = formattedPhone && phoneType !== 'unknown';
    const hasIdentity = name || firstName || company;
    
    if (hasValidPhone && hasIdentity) {
      validRows++;
    }
    
    // Create formatted lead
    const formattedLead: FormattedLead = {
      name,
      first_name: firstName,
      last_name: lastName,
      company,
      phone: formattedPhone,
      phone_type: phoneType,
      email,
      title,
      city,
      state,
      country,
      industry,
      website,
      sms_eligible: phoneType === 'mobile',
      location,
      revenue,
      employees,
      linkedin_url: linkedinUrl,
      original_data: { ...lead }
    };
    
    formattedLeads.push(formattedLead);
  });
  
  // Generate availability analysis
  const availableVariables: string[] = [];
  
  // Check which variables have data
  if (nameCount > 0) availableVariables.push('name', 'first_name', 'last_name');
  if (companyCount > 0) availableVariables.push('company');
  if (phonesSeen.size > 0) availableVariables.push('phone');
  if (emailCount > 0) availableVariables.push('email');
  if (fieldMappings.city && formattedLeads.some(l => l.city)) availableVariables.push('city', 'location');
  if (fieldMappings.state && formattedLeads.some(l => l.state)) availableVariables.push('state');
  if (fieldMappings.country && formattedLeads.some(l => l.country)) availableVariables.push('country');
  if (fieldMappings.title && formattedLeads.some(l => l.title)) availableVariables.push('title');
  if (fieldMappings.industry && formattedLeads.some(l => l.industry)) availableVariables.push('industry');
  if (fieldMappings.website && formattedLeads.some(l => l.website)) availableVariables.push('website');
  if (fieldMappings.revenue && formattedLeads.some(l => l.revenue)) availableVariables.push('revenue');
  if (fieldMappings.employees && formattedLeads.some(l => l.employees)) availableVariables.push('employees');
  if (fieldMappings.linkedin_url && formattedLeads.some(l => l.linkedin_url)) availableVariables.push('linkedin_url');
  
  // Always available system variables
  availableVariables.push('date', 'time', 'current_month', 'current_year', 'day_of_week');
  
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