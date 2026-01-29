import 'dotenv/config';
import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import { TASK_QUEUE_NAME } from './shared';

async function run() {
  // Step 1: Connect to Temporal Server
  // Ensure you have Temporal server running locally (temporal server start-dev)
  
  const worker = await Worker.create({
    connection: await NativeConnection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    }),
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
