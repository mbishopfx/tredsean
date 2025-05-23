import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by a cron job or external scheduler
// to automatically process drip campaign messages

export async function POST(request: NextRequest) {
  try {
    console.log('🕐 Drip campaign scheduler triggered...');
    
    // Call the send-batch endpoint to process due messages
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/drip-campaign/send-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Drip campaign processing completed successfully');
      return NextResponse.json({
        success: true,
        message: 'Drip campaign messages processed successfully',
        processingResult: data
      });
    } else {
      throw new Error(data.error || 'Failed to process drip campaign messages');
    }

  } catch (error) {
    console.error('❌ Error in drip campaign scheduler:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process drip campaign messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check what would be processed
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/drip-campaign/send-batch`);
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Drip campaign status check',
      ...data
    });

  } catch (error) {
    console.error('Error checking drip campaign status:', error);
    return NextResponse.json(
      { error: 'Failed to check drip campaign status' },
      { status: 500 }
    );
  }
} 