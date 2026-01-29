import { NextResponse } from 'next/server';
import { Connection, Client } from '@temporalio/client';
import { nanoid } from 'nanoid';

// In a real app, import this from a shared package
const TASK_QUEUE_NAME = 'content-publishing-queue';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, authorEmail } = body;

    if (!topic || !authorEmail) {
      return NextResponse.json({ error: 'Missing topic or email' }, { status: 400 });
    }

    const connection = await Connection.connect({ address: process.env.NEXT_PUBLIC_TEMPORAL_ADDRESS || 'localhost:7233' });
    const client = new Client({ connection });

    const workflowId = `publish-${nanoid()}`;

    const handle = await client.workflow.start('contentPublishingWorkflow', {
      taskQueue: TASK_QUEUE_NAME,
      args: [{ topic, authorEmail }],
      workflowId,
    });

    return NextResponse.json({ workflowId });
  } catch (error: any) {
    console.error('Error starting workflow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflowId');

  if (!workflowId) {
    return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
  }

  try {
    const connection = await Connection.connect({ address: process.env.NEXT_PUBLIC_TEMPORAL_ADDRESS || 'localhost:7233' });
    const client = new Client({ connection });

    const handle = client.workflow.getHandle(workflowId);
    
    // Get the current status
    const description = await handle.describe();
    const status = description.status.name;
    
    let result = null;
    if (status === 'COMPLETED') {
      result = await handle.result();
    }

    // We can also query for history events to show progress if we added custom search attributes or query handlers
    // For simplicity in this demo, we'll infer progress from status or just show "Processing"
    
    // To get more granular progress, we'd typically use a Query method in the workflow
    // For now, we'll return the raw status and result if available

    return NextResponse.json({ 
      status, 
      result,
      historyLength: description.historyLength // approximate progress indicator
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
