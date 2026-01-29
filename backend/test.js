
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const WORKFLOW_API = 'http://localhost:3000/api/publish';

async function verifyDetailedContent() {
  console.log('🧪 Starting Detailed Content Verification...');

  try {
    const topic = 'The Future of Autonomous Agents in Software Engineering';
    console.log(`1️⃣  Triggering workflow for topic: "${topic}"`);

    const startRes = await fetch(WORKFLOW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic, 
        authorEmail: 'detailed-test@example.com' 
      })
    });

    if (!startRes.ok) throw new Error(`API Error: ${await startRes.text()}`);
    const { workflowId } = await startRes.json();
    console.log(`   ✅ Workflow started. ID: ${workflowId}`);

    // Poll
    console.log('2️⃣  Polling for completion...');
    let status = 'RUNNING';
    let result = null;
    let attempts = 0;
    while ((status === 'RUNNING' || status === 'Processing') && attempts < 60) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(`${WORKFLOW_API}?workflowId=${workflowId}`);
      const data = await pollRes.json();
      status = data.status;
      result = data.result;
      process.stdout.write('.');
      attempts++;
    }
    console.log('');

    if (status !== 'COMPLETED') {
      throw new Error(`Workflow failed: ${status} - ${result?.rejectionReason || ''}`);
    }

    // Verify
    const fileUrl = new URL(result.finalUrl);
    const filePath = fileUrl.pathname; 
    
    console.log(`3️⃣  Checking file content at: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const size = content.length;
      console.log(`   ✅ File exists! Size: ${size} characters.`);
      
      console.log('\n📄 CONTENT PREVIEW (First 500 chars):\n' + '-'.repeat(50));
      console.log(content.substring(0, 500));
      console.log('-'.repeat(50));
      
      // Heuristic check for "detail"
      if (size < 200) {
        console.warn('⚠️  WARNING: Content seems too short for a detailed article.');
      } else {
        console.log('✨ Content length looks good!');
      }

    } else {
      throw new Error(`File not found at ${filePath}`);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

verifyDetailedContent();
