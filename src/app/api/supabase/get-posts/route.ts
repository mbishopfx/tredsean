import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'anonymous';

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ posts: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get posts from team_posts table
    const { data: posts, error } = await supabase
      .from('team_posts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ posts: [] });
  }
} 