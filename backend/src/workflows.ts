import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { WorkflowInput, WorkflowResult } from './shared';

const { generateContent, checkContentSafety, publishToCMS, sendNotification } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumAttempts: 5, // Limit retries for demo purposes
  }
});

export async function contentPublishingWorkflow(input: WorkflowInput): Promise<WorkflowResult> {
  const { topic, authorEmail } = input;

  // Step 1: Generate
  const content = await generateContent(topic);

  // Step 2: Safety Check
  const safetyStatus = await checkContentSafety(content);
  if (safetyStatus === 'UNSAFE') {
    return {
      status: 'REJECTED',
      rejectionReason: 'Content violated safety guidelines.'
    };
  }

  // Step 3: Publish (Automatic Retries handled by Temporal)
  let url: string;
  try {
    url = await publishToCMS(content);
  } catch (err) {
    // If we exhaust retries, we can return FAILED
    return {
      status: 'FAILED',
      rejectionReason: 'Failed to publish to CMS after multiple attempts.'
    };
  }

  // Step 4: Notify
  await sendNotification(authorEmail, url);

  return {
    status: 'PUBLISHED',
    finalUrl: url
  };
}
