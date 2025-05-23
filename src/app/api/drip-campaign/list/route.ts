import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// TypeScript interfaces
interface ScheduledMessage {
  id: string;
  campaignId: string;
  contactPhone: string;
  contactName: string;
  messageText: string;
  templateDay: number;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  twilioSid?: string;
  error?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  totalContacts: number;
  sentMessages: number;
  replies: number;
  deliveredMessages: number;
  failedMessages: number;
  created: string;
  lastActivity?: string;
  nextScheduledMessage?: string;
  completionRate: number;
}

// Simple JSON file-based storage for campaigns (in production, use a real database)
const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'drip-campaigns.json');
const MESSAGES_FILE = path.join(process.cwd(), 'data', 'drip-messages.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read campaigns from storage
const getCampaigns = (): Campaign[] => {
  ensureDataDir();
  if (!fs.existsSync(CAMPAIGNS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading campaigns:', error);
    return [];
  }
};

// Read scheduled messages from storage
const getScheduledMessages = (): ScheduledMessage[] => {
  ensureDataDir();
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scheduled messages:', error);
    return [];
  }
};

// Calculate campaign statistics from Twilio message history
const calculateCampaignStats = async (campaignId: string) => {
  try {
    const scheduledMessages = getScheduledMessages();
    const campaignMessages = scheduledMessages.filter((msg: ScheduledMessage) => msg.campaignId === campaignId);
    
    // For each message, check if it was sent via Twilio
    // This would typically query your message delivery logs
    const stats = {
      sentMessages: campaignMessages.filter((msg: ScheduledMessage) => msg.status === 'sent' || msg.status === 'delivered').length,
      deliveredMessages: campaignMessages.filter((msg: ScheduledMessage) => msg.status === 'delivered').length,
      failedMessages: campaignMessages.filter((msg: ScheduledMessage) => msg.status === 'failed').length,
      replies: 0, // This would come from Twilio webhook data
      completionRate: 0
    };
    
    // Calculate completion rate based on scheduled vs sent messages
    const totalScheduled = campaignMessages.length;
    const totalSent = stats.sentMessages;
    stats.completionRate = totalScheduled > 0 ? (totalSent / totalScheduled) * 100 : 0;
    
    return stats;
  } catch (error) {
    console.error('Error calculating campaign stats:', error);
    return {
      sentMessages: 0,
      deliveredMessages: 0,
      failedMessages: 0,
      replies: 0,
      completionRate: 0
    };
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'paused', 'completed'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    
    // Get campaigns from storage
    let campaigns = getCampaigns();
    
    // Enhance campaigns with real-time statistics
    for (const campaign of campaigns) {
      const stats = await calculateCampaignStats(campaign.id);
      Object.assign(campaign, stats);
      
      // Update last activity based on recent message activity
      const scheduledMessages = getScheduledMessages();
      const campaignMessages = scheduledMessages.filter((msg: ScheduledMessage) => msg.campaignId === campaign.id);
      const latestMessage = campaignMessages
        .filter((msg: ScheduledMessage) => msg.sentAt)
        .sort((a: ScheduledMessage, b: ScheduledMessage) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0];
      
      if (latestMessage) {
        campaign.lastActivity = latestMessage.sentAt;
      }
      
      // Calculate next scheduled message
      const nextMessage = campaignMessages
        .filter((msg: ScheduledMessage) => msg.status === 'scheduled' && new Date(msg.scheduledFor) > new Date())
        .sort((a: ScheduledMessage, b: ScheduledMessage) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())[0];
      
      campaign.nextScheduledMessage = nextMessage ? nextMessage.scheduledFor : undefined;
    }
    
    // Filter campaigns based on query parameters
    let filteredCampaigns = [...campaigns];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter((campaign: Campaign) => campaign.status === status);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter((campaign: Campaign) => 
        campaign.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by most recent activity
    filteredCampaigns.sort((a: Campaign, b: Campaign) => 
      new Date(b.lastActivity || b.created).getTime() - new Date(a.lastActivity || a.created).getTime()
    );
    
    // Pagination
    const total = filteredCampaigns.length;
    const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit);
    
    // Calculate summary stats
    const activeCampaigns = campaigns.filter((c: Campaign) => c.status === 'active').length;
    const totalContacts = campaigns.reduce((sum: number, c: Campaign) => sum + (c.totalContacts || 0), 0);
    const totalMessages = campaigns.reduce((sum: number, c: Campaign) => sum + (c.sentMessages || 0), 0);
    const totalReplies = campaigns.reduce((sum: number, c: Campaign) => sum + (c.replies || 0), 0);
    
    return NextResponse.json({
      success: true,
      campaigns: paginatedCampaigns,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      summary: {
        activeCampaigns,
        totalCampaigns: campaigns.length,
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