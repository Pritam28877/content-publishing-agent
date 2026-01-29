import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import { TASK_QUEUE_NAME } from './shared';

async function run() {
  // Step 1: Connect to Temporal Server
  // Ensure you have Temporal server running locally (temporal server start-dev)
  
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: TASK_QUEUE_NAME,
  });

  console.log(`Worker started on queue: ${TASK_QUEUE_NAME}`);
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
