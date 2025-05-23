import { NextRequest, NextResponse } from 'next/server';

interface AddToPipelineRequest {
  campaignId: string;
  contactId: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: AddToPipelineRequest = await request.json();
    
    // Validate required fields
    if (!data.campaignId || !data.contactId) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId or contactId' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Look up the contact details from the campaign
    // 2. Search for existing lead in Close CRM by phone number
    // 3. Create or update the lead
    // 4. Add to pipeline with appropriate status
    // 5. Create follow-up task
    // 6. Add tags indicating this came from a drip campaign
    
    // For now, we'll simulate the process
    console.log(`Adding contact ${data.contactId} from campaign ${data.campaignId} to pipeline`);
    
    // Mock pipeline addition process
    const mockPipelineResult = {
      success: true,
      leadId: `lead_${Date.now()}`,
      opportunityId: `opp_${Date.now()}`,
      taskId: `task_${Date.now()}`,
      actions: [
        {
          action: 'create_or_update_lead',
          success: true,
          leadId: `lead_${Date.now()}`,
          details: 'Lead created/updated with drip campaign context'
        },
        {
          action: 'create_opportunity',
          success: true,
          opportunityId: `opp_${Date.now()}`,
          value: 190000, // $1900 in cents
          note: 'Successful Drip Campaign Lead'
        },
        {
          action: 'create_task',
          success: true,
          taskId: `task_${Date.now()}`,
          taskText: 'Follow up on drip campaign response',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
        },
        {
          action: 'add_tags',
          success: true,
          tags: ['Drip-Campaign', 'Hot-Lead', 'Follow-Up-Required']
        }
      ]
    };
    
    // In production, you would make actual API calls to:
    // 1. Close CRM to create/update lead
    // 2. Create opportunity with "Successful Drip Campaign Lead"
    // 3. Create follow-up task
    // 4. Add appropriate tags
    
    return NextResponse.json({
      success: true,
      message: 'Contact successfully added to pipeline',
      results: mockPipelineResult
    });
    
  } catch (error) {
    console.error('Error adding contact to pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to add contact to pipeline' },
      { status: 500 }
    );
  }
} 