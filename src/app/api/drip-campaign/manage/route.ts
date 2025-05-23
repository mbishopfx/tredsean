import { NextRequest, NextResponse } from 'next/server';

interface ManageCampaignRequest {
  campaignId: string;
  action: 'pause' | 'resume' | 'delete' | 'duplicate';
  newName?: string; // For duplicate action
}

export async function POST(request: NextRequest) {
  try {
    const data: ManageCampaignRequest = await request.json();
    
    // Validate required fields
    if (!data.campaignId || !data.action) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId or action' },
        { status: 400 }
      );
    }
    
    const validActions = ['pause', 'resume', 'delete', 'duplicate'];
    if (!validActions.includes(data.action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }
    
    console.log(`Managing campaign ${data.campaignId}: ${data.action}`);
    
    // In a real implementation, you would:
    // 1. Verify user has permission to manage this campaign
    // 2. Update campaign status in database
    // 3. Cancel/reschedule queued messages for pause/resume
    // 4. Clean up all associated data for delete
    // 5. Clone campaign data for duplicate
    
    let result;
    
    switch (data.action) {
      case 'pause':
        result = {
          success: true,
          message: 'Campaign paused successfully',
          campaign: {
            id: data.campaignId,
            status: 'paused',
            pausedAt: new Date().toISOString(),
            queuedMessagesCount: 45, // Mock number of messages that were cancelled
          }
        };
        break;
        
      case 'resume':
        result = {
          success: true,
          message: 'Campaign resumed successfully',
          campaign: {
            id: data.campaignId,
            status: 'active',
            resumedAt: new Date().toISOString(),
            nextScheduledMessage: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            rescheduledMessagesCount: 45, // Mock number of messages that were rescheduled
          }
        };
        break;
        
      case 'delete':
        result = {
          success: true,
          message: 'Campaign deleted successfully',
          campaign: {
            id: data.campaignId,
            status: 'deleted',
            deletedAt: new Date().toISOString(),
            cleanupActions: [
              'Cancelled 32 scheduled messages',
              'Archived campaign data',
              'Updated contact statuses',
              'Removed from active monitoring'
            ]
          }
        };
        break;
        
      case 'duplicate':
        const newCampaignId = `camp_${Date.now()}_copy`;
        result = {
          success: true,
          message: 'Campaign duplicated successfully',
          originalCampaign: {
            id: data.campaignId
          },
          newCampaign: {
            id: newCampaignId,
            name: data.newName || `Copy of Campaign ${data.campaignId}`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            copiedElements: [
              'Message templates',
              'Sequence timing',
              'Variable mappings',
              'Campaign settings'
            ]
          }
        };
        break;
        
      default:
        throw new Error('Invalid action');
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error managing drip campaign:', error);
    return NextResponse.json(
      { error: 'Failed to manage campaign' },
      { status: 500 }
    );
  }
} 