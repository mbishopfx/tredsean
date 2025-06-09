import { NextRequest, NextResponse } from 'next/server';
// import { AuditStorage } from '@/lib/supabase'; // Temporarily disabled for deployment

export async function POST(request: NextRequest) {
  try {
    const { auditId, salesPitchData } = await request.json();

    if (!auditId || !salesPitchData) {
      return NextResponse.json(
        { error: 'Audit ID and sales pitch data are required' },
        { status: 400 }
      );
    }

    // Save sales pitch to permanent storage - temporarily disabled for deployment
    // await AuditStorage.saveSalesPitch(auditId, salesPitchData);

    return NextResponse.json({ 
      success: true, 
      message: 'Sales pitch saved successfully (storage temporarily disabled)' 
    });

  } catch (error) {
    console.error('Error saving sales pitch:', error);
    return NextResponse.json(
      { error: 'Failed to save sales pitch' },
      { status: 500 }
    );
  }
} 