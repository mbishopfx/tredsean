import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing - in production, this would come from a database
const mockCampaigns = [
  {
    id: 'camp_1',
    name: 'Real Estate Q1 2024',
    status: 'active',
    totalContacts: 156,
    sentMessages: 342,
    replies: 19,
    deliveredMessages: 335,
    failedMessages: 7,
    created: '2024-01-15T10:00:00Z',
    lastActivity: '2024-01-20T14:30:00Z',
    nextScheduledMessage: '2024-01-21T09:00:00Z',
    completionRate: 45.2
  },
  {
    id: 'camp_2', 
    name: 'Lead Follow-up December',
    status: 'paused',
    totalContacts: 89,
    sentMessages: 178,
    replies: 12,
    deliveredMessages: 170,
    failedMessages: 8,
    created: '2023-12-01T09:00:00Z',
    lastActivity: '2024-01-19T11:15:00Z',
    nextScheduledMessage: null,
    completionRate: 67.8
  },
  {
    id: 'camp_3',
    name: 'Commercial Property Outreach',
    status: 'active',
    totalContacts: 203,
    sentMessages: 487,
    replies: 31,
    deliveredMessages: 478,
    failedMessages: 9,
    created: '2024-01-10T08:00:00Z',
    lastActivity: '2024-01-20T16:45:00Z',
    nextScheduledMessage: '2024-01-22T10:00:00Z',
    completionRate: 32.1
  },
  {
    id: 'camp_4',
    name: 'Investor Networking Campaign',
    status: 'active',
    totalContacts: 124,
    sentMessages: 298,
    replies: 22,
    deliveredMessages: 291,
    failedMessages: 7,
    created: '2024-01-18T14:00:00Z',
    lastActivity: '2024-01-20T12:30:00Z',
    nextScheduledMessage: '2024-01-21T15:00:00Z',
    completionRate: 38.7
  },
  {
    id: 'camp_5',
    name: 'Luxury Home Buyers',
    status: 'active',
    totalContacts: 67,
    sentMessages: 134,
    replies: 8,
    deliveredMessages: 131,
    failedMessages: 3,
    created: '2024-01-19T11:00:00Z',
    lastActivity: '2024-01-20T10:15:00Z',
    nextScheduledMessage: '2024-01-21T11:30:00Z',
    completionRate: 23.9
  },
  {
    id: 'camp_6',
    name: 'First Time Home Buyers',
    status: 'completed',
    totalContacts: 95,
    sentMessages: 855,
    replies: 43,
    deliveredMessages: 847,
    failedMessages: 8,
    created: '2023-11-15T09:00:00Z',
    lastActivity: '2024-01-15T17:00:00Z',
    nextScheduledMessage: null,
    completionRate: 100
  },
  {
    id: 'camp_7',
    name: 'Property Management Leads',
    status: 'active',
    totalContacts: 178,
    sentMessages: 267,
    replies: 15,
    deliveredMessages: 261,
    failedMessages: 6,
    created: '2024-01-20T16:00:00Z',
    lastActivity: '2024-01-20T18:20:00Z',
    nextScheduledMessage: '2024-01-23T09:00:00Z',
    completionRate: 18.5
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'paused', 'completed'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    
    // Filter campaigns based on query parameters
    let filteredCampaigns = [...mockCampaigns];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by most recent activity
    filteredCampaigns.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    
    // Pagination
    const total = filteredCampaigns.length;
    const campaigns = filteredCampaigns.slice(offset, offset + limit);
    
    // Calculate summary stats
    const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').length;
    const totalContacts = mockCampaigns.reduce((sum, c) => sum + c.totalContacts, 0);
    const totalMessages = mockCampaigns.reduce((sum, c) => sum + c.sentMessages, 0);
    const totalReplies = mockCampaigns.reduce((sum, c) => sum + c.replies, 0);
    
    // In a real application, you would:
    // 1. Verify user authentication
    // 2. Query your database for campaigns belonging to the user
    // 3. Apply proper filtering and pagination
    // 4. Calculate real-time statistics
    
    return NextResponse.json({
      success: true,
      campaigns,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      summary: {
        activeCampaigns,
        totalCampaigns: mockCampaigns.length,
        totalContacts,
        totalMessages,
        totalReplies,
        overallReplyRate: totalMessages > 0 ? ((totalReplies / totalMessages) * 100).toFixed(1) : 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching drip campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drip campaigns' },
      { status: 500 }
    );
  }
} 