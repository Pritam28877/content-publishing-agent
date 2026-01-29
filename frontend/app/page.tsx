'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [email, setEmail] = useState('');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    setResult(null);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, authorEmail: email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setWorkflowId(data.workflowId);
      setStatus('RUNNING');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workflowId || status === 'COMPLETED' || status === 'FAILED') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/publish?workflowId=${workflowId}`);
        const data = await res.json();
        
        if (data.status) {
          setStatus(data.status);
          if (data.status === 'COMPLETED') {
            setResult(data.result);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [workflowId, status]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Agent Operations Center
          </h1>
          <p className="text-gray-400 mt-2">Autonomous Content Publishing Pipeline</p>
        </header>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🚀 New Assignment
          </h2>
          
          <form onSubmit={startWorkflow} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Content Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Future of Quantum Computing"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Author Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@company.com"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || (!!workflowId && status === 'RUNNING')}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all"
            >
              {loading ? 'Initializing...' : 'Dispatch Agent'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
              Error: {error}
            </div>
          )}
        </section>

        {workflowId && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300">Live Execution Status</h2>
            
            <div className="grid gap-4">
              {/* Workflow Status Card */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <div className={`w-32 h-32 rounded-full ${status === 'RUNNING' ? 'bg-yellow-500 animate-pulse' : status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-500'}`} />
                </div>
                
                <div className="relative z-10">
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Workflow ID</div>
                  <code className="bg-gray-900 px-2 py-1 rounded text-sm font-mono text-blue-300 block w-fit mb-4">
                    {workflowId}
                  </code>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">Current State</span>
                      <span className={`text-2xl font-bold ${
                        status === 'RUNNING' ? 'text-yellow-400' :
                        status === 'COMPLETED' ? 'text-green-400' :
                        'text-red-400'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps Visualization (Mocked based on status for simplicity) */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                 <h3 className="text-lg font-medium mb-4">Pipeline Steps</h3>
                 <div className="space-y-4">
                    <StepItem 
                      label="1. Content Generation (LLM)" 
                      status={status === 'RUNNING' ? 'processing' : 'completed'} 
                    />
                    <StepItem 
                      label="2. Safety Policy Check" 
                      status={status === 'RUNNING' ? 'pending' : (result?.status === 'REJECTED' ? 'failed' : 'completed')} 
                    />
                    <StepItem 
                      label="3. CMS Publishing (Retries Enabled)" 
                      status={status === 'RUNNING' ? 'pending' : (result?.status === 'PUBLISHED' ? 'completed' : 'pending')} 
                    />
                    <StepItem 
                      label="4. Notification" 
                      status={status === 'RUNNING' ? 'pending' : (result?.status === 'PUBLISHED' ? 'completed' : 'pending')} 
                    />
                 </div>
              </div>

              {/* Final Result */}
              {result && (
                <div className={`p-6 rounded-xl border ${
                  result.status === 'PUBLISHED' ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                }`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {result.status === 'PUBLISHED' ? '✅ Published Successfully' : '❌ Publication Rejected'}
                  </h3>
                  
                  {result.finalUrl && (
                    <a href={result.finalUrl} target="_blank" className="text-blue-400 underline break-all">
                      {result.finalUrl}
                    </a>
                  )}
                  
                  {result.rejectionReason && (
                    <p className="text-red-300">{result.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepItem({ label, status }: { label: string, status: 'pending' | 'processing' | 'completed' | 'failed' }) {
  let color = "bg-gray-700 border-gray-600";
  let icon = "○";
  
  if (status === 'processing') {
    color = "bg-blue-900/50 border-blue-500 animate-pulse";
    icon = "●";
  } else if (status === 'completed') {
    color = "bg-green-900/50 border-green-500";
    icon = "✓";
  } else if (status === 'failed') {
    color = "bg-red-900/50 border-red-500";
    icon = "✕";
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded border ${color} transition-all`}>
      <span className="font-mono text-lg">{icon}</span>
      <span className={status === 'pending' ? 'text-gray-500' : 'text-gray-200'}>{label}</span>
    </div>
  );
}
