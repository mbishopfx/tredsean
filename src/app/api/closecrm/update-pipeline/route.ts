import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, handleCloseApiError, updateLeadStatus } from '../utils';

export async function POST(request: NextRequest) {
  try {
    const { leadId, pipelineId, statusId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    if (!pipelineId) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 });
    }

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }
    
    console.log(`Updating pipeline status for lead ${leadId}`);
    console.log(`Pipeline ID: ${pipelineId}, Status ID: ${statusId}`);
    
    const client = getCloseClient();
    
    try {
      // Use the new utility function to update the lead status
      const updatedLead = await updateLeadStatus(client, leadId, statusId);
      
      // Get lead data for the response
      const leadResponse = await client.get(`/lead/${leadId}`);
      const lead = leadResponse.data;
      
      return NextResponse.json({
        success: true,
        message: 'Pipeline status updated successfully',
        lead: {
          id: leadId,
          name: lead.display_name || 'Unknown',
          status: lead.status_label || 'Updated'
        }
      });
    } catch (error: any) {
      console.error('Error updating lead:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error; // Re-throw to be handled by the outer catch
    }
    
  } catch (error) {
    const { message, status } = handleCloseApiError(error);
    return NextResponse.json({ 
      error: message,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status });
  }
} 