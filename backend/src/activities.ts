import { Context } from '@temporalio/activity';
import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateContent(topic: string): Promise<string> {
  console.log(`[Activity] Generating detailed content for topic: ${topic}`);
  
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert technical writer. Write a comprehensive, detailed, and engaging article about the provided topic. The article should be formatted in Markdown. Include a catchy title, introduction, key concepts, detailed analysis, pros/cons (if applicable), and a conclusion. Aim for at least 500 words." 
        },
        { role: "user", content: `Write a detailed article about: ${topic}` }
      ],
      model: "gpt-4o", // Using a high-quality model
    });

    const content = completion.choices[0].message.content || "No content generated.";
    console.log(`[Activity] Content generated (${content.length} chars)`);
    return content;

  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    // Fallback if API fails (e.g., quota exceeded or invalid key)
    return `
# ${topic} (Fallback Content)

**Note:** AI generation failed. This is a placeholder detailed structure.

## Introduction
The topic of **${topic}** is increasingly significant in today's landscape...

## Key Aspects
1. **Innovation**: How ${topic} is changing the world.
2. **Challenges**: What hurdles remain.
3. **Future**: Where we are going.

*Error Details: ${error.message}*
`;
  }
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
  
  // Use local file system as CMS
  const postsDir = path.join(process.cwd(), 'published_content');
  
  try {
    await fs.mkdir(postsDir, { recursive: true });
    
    const timestamp = Date.now();
    const filename = `post-${timestamp}.md`;
    const filepath = path.join(postsDir, filename);
    
    // Add some metadata to the file
    const fileContent = `---
id: ${timestamp}
publishedAt: ${new Date().toISOString()}
---

${content}
`;
    
    await fs.writeFile(filepath, fileContent, 'utf-8');
    console.log(`[Activity] Published locally to ${filepath}`);
    
    // Return a local file URL or path
    return `file://${filepath}`;
    
  } catch (error: any) {
    console.error(`[Activity] Failed to publish locally: ${error.message}`);
    throw error;
  }
}

export async function sendNotification(email: string, url: string): Promise<void> {
  console.log(`[Activity] Sending notification to ${email} with URL: ${url}`);
  await new Promise(resolve => setTimeout(resolve, 500));
}
