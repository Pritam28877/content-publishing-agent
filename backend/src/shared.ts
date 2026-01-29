export interface WorkflowInput {
  topic: string;
  authorEmail: string;
}

export interface WorkflowResult {
  status: 'PUBLISHED' | 'REJECTED' | 'FAILED';
  finalUrl?: string;
  rejectionReason?: string;
}

export const TASK_QUEUE_NAME = 'content-publishing-queue';
