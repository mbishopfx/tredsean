import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, handleCloseApiError } from '../utils';

export async function POST(request: NextRequest) {
  try {
    const { leadId, text, dueDate, assignedTo } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
    }
    
    const client = getCloseClient();
    
    // Create the task
    const task = await client.post('/task', {
      lead_id: leadId,
      text: text,
      due_date: dueDate || null, // Format: YYYY-MM-DD
      assigned_to: assignedTo || null // User ID or null for unassigned
    });
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      taskId: task.data.id
    });
    
  } catch (error) {
    const { message, status } = handleCloseApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
} 