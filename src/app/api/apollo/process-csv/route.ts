import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  [key: string]: string;
}

interface ProcessedLead {
  [key: string]: string;
}

// Phone number validation and type detection
function detectPhoneType(phone: string): 'mobile' | 'landline' | 'voip' | 'unknown' {
  if (!phone) return 'unknown';
  
  // Clean phone number
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) return 'unknown';
  
  // Get area code and prefix
  const areaCode = cleaned.substring(0, 3);
  const prefix = cleaned.substring(3, 6);
  
  // Common mobile area codes (partial list)
  const mobileAreaCodes = ['201', '202', '203', '212', '213', '214', '215', '216', '217', '218', '219', '224', '225', '228', '229', '231', '234', '239', '240', '248', '251', '252', '253', '254', '256', '260', '262', '267', '269', '270', '276', '281', '301', '302', '303', '304', '305', '307', '308', '309', '310', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '323', '325', '330', '331', '334', '336', '337', '339', '346', '347', '351', '352', '360', '361', '364', '380', '385', '386', '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '415', '417', '419', '423', '424', '425', '430', '432', '434', '435', '440', '442', '443', '458', '463', '464', '469', '470', '475', '478', '479', '480', '484', '501', '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517', '518', '520', '530', '531', '534', '539', '540', '541', '551', '559', '561', '562', '563', '564', '567', '570', '571', '573', '574', '575', '580', '585', '586', '601', '602', '603', '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619', '620', '623', '626', '628', '629', '630', '631', '636', '641', '646', '650', '651', '657', '660', '661', '662', '667', '669', '678', '681', '682', '701', '702', '703', '704', '706', '707', '708', '712', '713', '714', '715', '716', '717', '718', '719', '720', '724', '725', '727', '731', '732', '734', '737', '740', '743', '747', '754', '757', '760', '762', '763', '765', '769', '770', '772', '773', '774', '775', '779', '781', '785', '786', '787', '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815', '816', '817', '818', '828', '830', '831', '832', '843', '845', '847', '848', '850', '856', '857', '858', '859', '860', '862', '863', '864', '865', '870', '872', '878', '901', '903', '904', '906', '907', '908', '909', '910', '912', '913', '914', '915', '916', '917', '918', '919', '920', '925', '928', '929', '931', '934', '936', '937', '940', '941', '947', '949', '951', '952', '954', '956', '959', '970', '971', '972', '973', '978', '979', '980', '984', '985', '989'];
  
  // VoIP indicators
  const voipAreaCodes = ['844', '855', '866', '877', '888'];
  
  if (voipAreaCodes.includes(areaCode)) {
    return 'voip';
  }
  
  // Business line indicators (common patterns)
  if (prefix.startsWith('555') || prefix.startsWith('800') || prefix.startsWith('888')) {
    return 'landline';
  }
  
  // Mobile number patterns
  if (mobileAreaCodes.includes(areaCode)) {
    return 'mobile';
  }
  
  // Default to unknown for unrecognized patterns
  return 'unknown';
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
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
      let bestPhoneType: 'mobile' | 'landline' | 'voip' | 'unknown' = 'unknown';
      
      for (const column of phoneColumns) {
        const phone = lead[column];
        if (phone && phone.trim()) {
          const phoneType = detectPhoneType(phone);
          if (phoneType === 'mobile' && bestPhoneType !== 'mobile') {
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
      processedLead.sms_eligible = (bestPhoneType === 'mobile').toString();
      
      return processedLead;
    });
    
    // Filter based on criteria
    let filteredLeads = processedLeads;
    
    switch (filterType) {
      case 'mobile_only':
        filteredLeads = processedLeads.filter(lead => lead.sms_eligible === 'true');
        break;
      case 'remove_landlines':
        filteredLeads = processedLeads.filter(lead => lead.phone_type !== 'landline');
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
      mobile_numbers: processedLeads.filter(l => l.phone_type === 'mobile').length,
      landlines: processedLeads.filter(l => l.phone_type === 'landline').length,
      voip: processedLeads.filter(l => l.phone_type === 'voip').length,
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