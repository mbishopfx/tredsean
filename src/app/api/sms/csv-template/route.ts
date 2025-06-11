import { NextResponse } from 'next/server';

export function GET() {
  // Create a CSV template with headers and example rows
  // ALL FIELDS PRESERVED - robust processing that keeps your data intact
  const csvContent = [
    'name,company,phone,email,title,city,state,industry',
    'John Doe,ABC Corp,+14155552671,john@abccorp.com,CEO,San Francisco,CA,Technology',
    'Jane Smith,XYZ Inc,+12125551234,jane@xyzinc.com,Marketing Director,New York,NY,Finance',
    'Mike Johnson,Acme Co,16504567890,mike@acme.com,Sales Manager,Palo Alto,CA,Manufacturing',
    'Sarah Williams,Tech Solutions,(415) 555-2233,sarah@techsol.com,CTO,San Francisco,CA,Software',
    'David Brown,Global Services,1-212-555-8900,david@global.com,VP Sales,New York,NY,Consulting'
  ].join('\n');
  
  // Create a response with the CSV content
  const response = new NextResponse(csvContent);
  
  // Set headers for file download
  response.headers.set('Content-Type', 'text/csv');
  response.headers.set('Content-Disposition', 'attachment; filename="sms_contacts_template.csv"');
  
  return response;
} 