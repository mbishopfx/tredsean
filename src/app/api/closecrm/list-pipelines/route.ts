import { NextRequest, NextResponse } from 'next/server';
import { getCloseClient, handleCloseApiError } from '../utils';

export async function GET(request: NextRequest) {
  try {
    const client = getCloseClient();
    
    // Get all pipelines
    const pipelinesResponse = await client.get('/pipeline');
    const pipelines = pipelinesResponse.data.data;
    
    // Format the response to include only what we need
    const formattedPipelines = pipelines.map((pipeline: any) => {
      return {
        id: pipeline.id,
        name: pipeline.name,
        statuses: pipeline.statuses.map((status: any) => {
          return {
            id: status.id,
            label: status.label,
            type: status.type,
            position: status.position
          };
        })
      };
    });
    
    return NextResponse.json({
      success: true,
      pipelines: formattedPipelines
    });
    
  } catch (error) {
    const { message, status } = handleCloseApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
} 