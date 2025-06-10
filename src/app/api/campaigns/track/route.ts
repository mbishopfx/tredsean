import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'campaigns.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(CAMPAIGNS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load campaigns from file
const loadCampaigns = () => {
  ensureDataDirectory();
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading campaigns:', error);
  }
  return [];
};

// Save campaigns to file
const saveCampaigns = (campaigns: any[]) => {
  ensureDataDirectory();
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
  } catch (error) {
    console.error('Error saving campaigns:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const { campaignId, type, totalRecipients, messageTemplate, contactData } = await request.json();

    const campaigns = loadCampaigns();
    
    const newCampaign = {
      campaignId,
      type,
      status: 'started',
      totalRecipients,
      successful: 0,
      failed: 0,
      pending: totalRecipients,
      messageTemplate,
      contactData: contactData || [],
      details: [],
      startTime: new Date().toISOString(),
      endTime: null,
      estimatedCost: (totalRecipients * 0.0075).toFixed(2),
      actualCost: '0.00',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'localhost'
      }
    };

    campaigns.push(newCampaign);
    saveCampaigns(campaigns);

    console.log(`📊 Created campaign tracking: ${campaignId} (${totalRecipients} recipients)`);

    return NextResponse.json({ 
      success: true, 
      campaignId,
      message: 'Campaign tracking started'
    });

  } catch (error: any) {
    console.error('❌ Campaign tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign tracking' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { campaignId, successful, failed, details, endTime } = await request.json();

    const campaigns = loadCampaigns();
    const campaignIndex = campaigns.findIndex((c: any) => c.campaignId === campaignId);

    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Update campaign
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      successful: successful || campaigns[campaignIndex].successful,
      failed: failed || campaigns[campaignIndex].failed,
      pending: campaigns[campaignIndex].totalRecipients - (successful || 0) - (failed || 0),
      details: details || campaigns[campaignIndex].details,
      endTime: endTime || campaigns[campaignIndex].endTime,
      actualCost: ((successful || 0) * 0.0075).toFixed(2),
      status: endTime ? 'completed' : 'in_progress'
    };

    saveCampaigns(campaigns);

    console.log(`📊 Updated campaign: ${campaignId} (${successful}/${campaigns[campaignIndex].totalRecipients} sent)`);

    return NextResponse.json({ 
      success: true, 
      campaign: campaigns[campaignIndex]
    });

  } catch (error: any) {
    console.error('❌ Campaign update error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const campaigns = loadCampaigns();

    if (campaignId) {
      const campaign = campaigns.find((c: any) => c.campaignId === campaignId);
      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(campaign);
    }

    // Return recent campaigns (sorted by start time)
    const recentCampaigns = campaigns
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit)
      .map((campaign: any) => ({
        campaignId: campaign.campaignId,
        type: campaign.type,
        status: campaign.status,
        totalRecipients: campaign.totalRecipients,
        successful: campaign.successful,
        failed: campaign.failed,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        actualCost: campaign.actualCost,
        successRate: campaign.totalRecipients > 0 
          ? ((campaign.successful / campaign.totalRecipients) * 100).toFixed(1)
          : '0.0'
      }));

    return NextResponse.json({
      campaigns: recentCampaigns,
      total: campaigns.length
    });

  } catch (error: any) {
    console.error('❌ Campaign fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
} 