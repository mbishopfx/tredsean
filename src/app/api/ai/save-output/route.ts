import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface AIOutputRecord {
  id?: string;
  tool_name: string;
  input_data: string;
  output_data: string;
  user_id: string;
  created_at?: string;
  metadata?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { toolName, inputData, outputData, userId, metadata } = await request.json();

    if (!toolName || !outputData || !userId) {
      return NextResponse.json(
        { error: 'Tool name, output data, and user ID are required' },
        { status: 400 }
      );
    }

    // Save AI output to storage
    const outputRecord: Partial<AIOutputRecord> = {
      tool_name: toolName,
      input_data: inputData || '',
      output_data: outputData,
      user_id: userId,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('ai_outputs')
      .insert(outputRecord)
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      outputId: data.id,
      message: 'AI output saved successfully'
    });

  } catch (error) {
    console.error('Error saving AI output:', error);
    return NextResponse.json(
      { error: 'Failed to save AI output' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const toolName = searchParams.get('toolName');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('ai_outputs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (toolName) {
      query = query.eq('tool_name', toolName);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      outputs: data || []
    });

  } catch (error) {
    console.error('Error fetching AI outputs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI outputs' },
      { status: 500 }
    );
  }
} 