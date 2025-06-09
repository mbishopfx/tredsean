import { NextRequest, NextResponse } from 'next/server';

interface Audit {
  id: string;
  type: 'seo' | 'gbp' | 'ai_analysis' | 'activity';
  title: string;
  data: any;
  createdAt: string;
  userId?: string;
  metadata?: {
    phoneNumber?: string;
    businessName?: string;
    website?: string;
    score?: number;
  };
}

// In-memory storage (in production, use a database)
let audits: Audit[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let filteredAudits = audits;
    
    if (type) {
      filteredAudits = filteredAudits.filter(audit => audit.type === type);
    }
    
    if (userId) {
      filteredAudits = filteredAudits.filter(audit => audit.userId === userId);
    }
    
    // Sort by creation date (newest first)
    filteredAudits = filteredAudits
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return NextResponse.json({ 
      audits: filteredAudits,
      total: filteredAudits.length 
    });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, data, userId, metadata } = body;
    
    if (!type || !title || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, data' },
        { status: 400 }
      );
    }
    
    const audit: Audit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      data,
      createdAt: new Date().toISOString(),
      userId,
      metadata
    };
    
    audits.push(audit);
    
    return NextResponse.json({ 
      audit,
      message: 'Audit saved successfully' 
    });
  } catch (error) {
    console.error('Error saving audit:', error);
    return NextResponse.json(
      { error: 'Failed to save audit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('id');
    
    if (!auditId) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }
    
    const initialLength = audits.length;
    audits = audits.filter(audit => audit.id !== auditId);
    
    if (audits.length === initialLength) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Audit deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
} 