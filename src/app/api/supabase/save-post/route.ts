import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post, username } = body;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save post to team_posts table
    const { data, error } = await supabase
      .from('team_posts')
      .insert([{
        id: post.id,
        author: post.author,
        author_role: post.authorRole,
        content: post.content,
        timestamp: post.timestamp,
        post_type: post.type,
        likes: post.likes || 0,
        comments: post.comments || [],
        ai_generated: post.aiGenerated || false,
        category: post.category || null,
        created_by: username
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 