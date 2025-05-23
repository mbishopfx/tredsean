import { NextRequest, NextResponse } from 'next/server';

interface CampaignStats {
  campaignId: string;
  campaignName: string;
  status: 'active' | 'paused' | 'completed';
  created: string;
  totalContacts: number;
  messageSequence: Array<{
    day: number;
    sent: number;
    delivered: number;
    failed: number;
    replied: number;
    deliveryRate: number;
    replyRate: number;
  }>;
  overall: {
    totalMessagesSent: number;
    totalDelivered: number;
    totalReplied: number;
    totalFailed: number;
    overallDeliveryRate: number;
    overallReplyRate: number;
    pipelineAdds: number;
    activeCost: number;
  };
  topResponders: Array<{
    phone: string;
    name: string;
    repliedOnDay: number;
    addedToPipeline: boolean;
  }>;
  nonResponders: Array<{
    phone: string;
    name: string;
    lastMessageDay: number;
    totalMessagesSent: number;
  }>;
}

// Mock function to generate campaign statistics
const generateCampaignStats = (campaignId: string): CampaignStats => {
  // Mock data - in production, this would come from your database
  const mockStats: CampaignStats = {
    campaignId,
    campaignName: 'Real Estate Q1 2024',
    status: 'active',
    created: '2024-01-15T10:00:00Z',
    totalContacts: 156,
    messageSequence: [
      { day: 1, sent: 156, delivered: 153, failed: 3, replied: 12, deliveryRate: 98.1, replyRate: 7.8 },
      { day: 3, sent: 144, delivered: 142, failed: 2, replied: 8, deliveryRate: 98.6, replyRate: 5.6 },
      { day: 5, sent: 136, delivered: 134, failed: 2, replied: 6, deliveryRate: 98.5, replyRate: 4.5 },
      { day: 7, sent: 130, delivered: 128, failed: 2, replied: 4, deliveryRate: 98.5, replyRate: 3.1 },
      { day: 9, sent: 126, delivered: 124, failed: 2, replied: 3, deliveryRate: 98.4, replyRate: 2.4 },
      { day: 11, sent: 123, delivered: 121, failed: 2, replied: 2, deliveryRate: 98.4, replyRate: 1.7 },
      { day: 13, sent: 121, delivered: 119, failed: 2, replied: 1, deliveryRate: 98.3, replyRate: 0.8 },
      { day: 15, sent: 120, delivered: 118, failed: 2, replied: 1, deliveryRate: 98.3, replyRate: 0.8 },
      { day: 17, sent: 119, delivered: 117, failed: 2, replied: 0, deliveryRate: 98.3, replyRate: 0.0 }
    ],
    overall: {
      totalMessagesSent: 1175,
      totalDelivered: 1156,
      totalReplied: 37,
      totalFailed: 19,
      overallDeliveryRate: 98.4,
      overallReplyRate: 3.2,
      pipelineAdds: 8,
      activeCost: 58.75 // $0.05 per message approximately
    },
    topResponders: [
      { phone: '+1234567890', name: 'John Smith', repliedOnDay: 1, addedToPipeline: true },
      { phone: '+1234567891', name: 'Sarah Johnson', repliedOnDay: 1, addedToPipeline: true },
      { phone: '+1234567892', name: 'Mike Davis', repliedOnDay: 3, addedToPipeline: true },
      { phone: '+1234567893', name: 'Lisa Brown', repliedOnDay: 3, addedToPipeline: false },
      { phone: '+1234567894', name: 'Tom Wilson', repliedOnDay: 5, addedToPipeline: true }
    ],
    nonResponders: [
      { phone: '+1234567895', name: 'Jennifer Lee', lastMessageDay: 17, totalMessagesSent: 9 },
      { phone: '+1234567896', name: 'Robert Taylor', lastMessageDay: 17, totalMessagesSent: 9 },
      { phone: '+1234567897', name: 'Amanda White', lastMessageDay: 15, totalMessagesSent: 8 },
      { phone: '+1234567898', name: 'David Martinez', lastMessageDay: 13, totalMessagesSent: 7 },
      { phone: '+1234567899', name: 'Emily Anderson', lastMessageDay: 11, totalMessagesSent: 6 }
    ]
  };
  
  return mockStats;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Verify user has access to this campaign
    // 2. Query database for campaign statistics
    // 3. Calculate real-time metrics from message logs
    // 4. Track reply status from webhook data
    // 5. Calculate costs from Twilio usage
    
    const stats = generateCampaignStats(campaignId);
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching drip campaign stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign statistics' },
      { status: 500 }
    );
  }
} 