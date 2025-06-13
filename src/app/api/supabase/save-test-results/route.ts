import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testData, username, timestamp } = body;

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save test results to sms_test_results table
    const { data, error } = await supabase
      .from('sms_test_results')
      .insert([{
        username,
        test_type: testData.testType,
        test_data: testData,
        timestamp,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 200 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving test results:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 200 });
  }
} 