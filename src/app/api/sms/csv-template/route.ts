import { NextResponse } from 'next/server';

export function GET() {
  // Create a CSV template with headers and example rows
  const csvContent = [
    'phone_number,name,company',
    '+14155552671,John Doe,ABC Corp',
    '+12125551234,Jane Smith,XYZ Inc',
    '16504567890,Mike Johnson,Acme Co',
    '(415) 555-2233,Sarah Williams,Tech Solutions',
    '1-212-555-8900,David Brown,Global Services'
  ].join('\n');
  
  // Create a response with the CSV content
  const response = new NextResponse(csvContent);
  
  // Set headers for file download
  response.headers.set('Content-Type', 'text/csv');
  response.headers.set('Content-Disposition', 'attachment; filename="sms_contacts_template.csv"');
  
  return response;
} 