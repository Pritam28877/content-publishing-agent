import { Context } from '@temporalio/activity';

export async function generateContent(topic: string): Promise<string> {
  console.log(`[Activity] Generating content for topic: ${topic}`);
  // Simulate LLM delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `This is a generated article about ${topic}. It explores the future trends and implications in depth.`;
}

export async function checkContentSafety(content: string): Promise<'SAFE' | 'UNSAFE'> {
  console.log(`[Activity] Checking content safety...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple mock: if topic contained "spam", it might produce unsafe content
  if (content.toLowerCase().includes('spam') || content.toLowerCase().includes('violation')) {
    return 'UNSAFE';
  }
  return 'SAFE';
}

export async function publishToCMS(content: string): Promise<string> {
  console.log(`[Activity] Publishing content...`);
  
  // Simulate flakiness (30% failure rate) to demonstrate retries
  const shouldFail = Math.random() < 0.3;
  if (shouldFail) {
    console.error(`[Activity] Publishing failed! Retrying...`);
    throw new Error('CMS API unavailable (Simulated Failure)');
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  return `https://blog.example.com/posts/${Date.now()}`;
}

export async function sendNotification(email: string, url: string): Promise<void> {
  console.log(`[Activity] Sending notification to ${email} with URL: ${url}`);
  await new Promise(resolve => setTimeout(resolve, 500));
}
