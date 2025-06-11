import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  [key: string]: string;
}

interface ProcessedLead {
  [key: string]: string;
}

// Phone number validation and type detection
function detectPhoneType(phone: string): 'sms_eligible' | 'toll_free' | 'unknown' {
  if (!phone) return 'unknown';
  
  // Clean phone number
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) return 'unknown';
  
  // Extract area code from US numbers
  let areaCode;
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US number with country code (+1)
    areaCode = cleaned.substring(1, 4);
  } else if (cleaned.length === 10) {
    // US number without country code
    areaCode = cleaned.substring(0, 3);
  } else {
    // International or invalid format
    return 'unknown';
  }
  
  // Toll-free numbers that should be filtered out for SMS
  const tollFreeAreaCodes = ['800', '844', '855', '866', '877', '888', '833', '855', '856', '880', '881', '882', '883', '884', '885', '886', '887', '889'];
  if (tollFreeAreaCodes.includes(areaCode)) return 'toll_free';
  
  // All other valid US numbers are considered SMS eligible
  // This is more reliable than trying to distinguish mobile vs landline
  return 'sms_eligible';
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle US numbers with country code +1
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  return phone; // Return original if not standard format
}

function parseCSV(csvText: string): LeadData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const leads: LeadData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const lead: LeadData = {};
      headers.forEach((header, index) => {
        lead[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
      });
      leads.push(lead);
    }
  }
  
  return leads;
}

function generateCSV(leads: ProcessedLead[]): string {
  if (leads.length === 0) return '';
  
  // PRESERVE ALL FIELDS - reliable processing with full data intact
  const headers = Object.keys(leads[0]);
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => 
      headers.map(header => {
        const value = lead[header] || '';
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filterType = formData.get('filterType') as string || 'mobile_only';
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const csvText = await file.text();
    const leads = parseCSV(csvText);
    
    if (leads.length === 0) {
      return NextResponse.json({ error: 'No valid data found in CSV' }, { status: 400 });
    }
    
    // Find phone number columns
    const phoneColumns = Object.keys(leads[0]).filter(key => 
      key.includes('phone') || key.includes('mobile') || key.includes('cell') || key.includes('number')
    );
    
    if (phoneColumns.length === 0) {
      return NextResponse.json({ error: 'No phone number columns found' }, { status: 400 });
    }
    
    // Process each lead
    const processedLeads: ProcessedLead[] = leads.map(lead => {
      const processedLead: ProcessedLead = { ...lead };
      
      // Find the best phone number
      let bestPhone = '';
      let bestPhoneType: 'sms_eligible' | 'toll_free' | 'unknown' = 'unknown';
      
      for (const column of phoneColumns) {
        const phone = lead[column];
        if (phone && phone.trim()) {
          const phoneType = detectPhoneType(phone);
          if (phoneType === 'sms_eligible' && bestPhoneType !== 'sms_eligible') {
            bestPhone = formatPhoneNumber(phone);
            bestPhoneType = phoneType;
          } else if (!bestPhone) {
            bestPhone = formatPhoneNumber(phone);
            bestPhoneType = phoneType;
          }
        }
      }
      
      processedLead.phone = bestPhone;
      processedLead.phone_type = bestPhoneType;
      processedLead.sms_eligible = (bestPhoneType === 'sms_eligible').toString();
      
      return processedLead;
    });
    
    // Filter based on criteria
    let filteredLeads = processedLeads;
    
    switch (filterType) {
      case 'mobile_only':
        filteredLeads = processedLeads.filter(lead => lead.sms_eligible === 'true');
        break;
      case 'remove_landlines':
        filteredLeads = processedLeads.filter(lead => lead.phone_type !== 'toll_free');
        break;
      case 'all_with_type':
        // Keep all leads but include phone type information
        break;
      default:
        filteredLeads = processedLeads.filter(lead => lead.sms_eligible === 'true');
    }
    
    // Remove duplicates based on phone number
    const uniqueLeads = filteredLeads.filter((lead, index, self) => 
      index === self.findIndex(l => l.phone === lead.phone)
    );
    
    const stats = {
      total_input: leads.length,
      mobile_numbers: processedLeads.filter(l => l.phone_type === 'sms_eligible').length,
      landlines: processedLeads.filter(l => l.phone_type !== 'sms_eligible').length,
      voip: processedLeads.filter(l => l.phone_type === 'toll_free').length,
      unknown: processedLeads.filter(l => l.phone_type === 'unknown').length,
      duplicates_removed: filteredLeads.length - uniqueLeads.length,
      final_output: uniqueLeads.length,
      sms_eligible: uniqueLeads.filter(l => l.sms_eligible === 'true').length
    };
    
    const outputCSV = generateCSV(uniqueLeads);
    
    return NextResponse.json({
      success: true,
      stats,
      csvData: outputCSV,
      filename: `processed_${file.name}`,
      phoneColumns: phoneColumns
    });
    
  } catch (error: any) {
    console.error('Error processing CSV:', error);
    return NextResponse.json({
      error: 'Failed to process CSV: ' + error.message
    }, { status: 500 });
  }
} 