'use client';

import React, { useState } from 'react';
import { ApiClient } from '../../../lib/api';
import { Bot, Sparkles, Send, Copy, Check, Mail, MessageSquare, ShieldAlert } from 'lucide-react';

export default function AIAssistantPage() {
  const [leadName, setLeadName] = useState('Marcus Vance');
  const [companyName, setCompanyName] = useState('TechFlow Cloud Inc');
  const [emailPurpose, setEmailPurpose] = useState<'FIRST_OUTREACH' | 'FOLLOW_UP' | 'PROPOSAL_SUBMISSION'>('PROPOSAL_SUBMISSION');
  const [tone, setTone] = useState<'PROFESSIONAL' | 'FRIENDLY' | 'CONCISE' | 'PERSUASIVE'>('PROFESSIONAL');
  const [specificGoal, setSpecificGoal] = useState('Schedule security architecture review call before contract finalization.');
  const [contextNotes, setContextNotes] = useState('Prospect expressed interest in NexusAI document RAG search and multi-tenant pipeline isolation.');

  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chat Copilot state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your NexusAI Sales & Operations Copilot. How can I assist with your pipeline, lead analysis, or outreach today?',
    },
  ]);
  const [isChatting, setIsChatting] = useState(false);

  const handleGenerateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCopied(false);

    try {
      const res = await ApiClient.post('/ai/generate-email', {
        leadName,
        companyName,
        emailPurpose,
        tone,
        specificGoal,
        contextNotes,
      });

      if (res.success && res.data) {
        setGeneratedEmail(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage('');
    setIsChatting(true);

    try {
      const res = await ApiClient.post('/ai/chat', { message: userMsg.content });
      if (res.success && res.data?.message) {
        setChatHistory((prev) => [...prev, res.data.message]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Unable to process AI request'}` },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-accent-purple" />
          <span>AI Sales Assistant & Organization Copilot</span>
        </h1>
        <p className="text-xs text-muted">
          Context-aware AI assistant leveraging live CRM records and organization knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Generator Panel */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-white">Targeted Sales Email Generator</h2>
          </div>

          <form onSubmit={handleGenerateEmail} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Lead Name</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Purpose</label>
                <select
                  value={emailPurpose}
                  onChange={(e: any) => setEmailPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300"
                >
                  <option value="FIRST_OUTREACH">First Outreach</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="PROPOSAL_SUBMISSION">Proposal Submission</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-300 mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e: any) => setTone(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300"
                >
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="FRIENDLY">Friendly</option>
                  <option value="CONCISE">Concise</option>
                  <option value="PERSUASIVE">Persuasive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Specific Goal</label>
              <input
                type="text"
                value={specificGoal}
                onChange={(e) => setSpecificGoal(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Context / Objections</label>
              <textarea
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Generate Pitch Email'}</span>
            </button>
          </form>

          {/* Generated Result */}
          {generatedEmail && (
            <div className="p-4 rounded-xl bg-background border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-accent-purple uppercase tracking-wider">
                  AI Output Draft
                </span>
                <button
                  onClick={copyToClipboard}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-300 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-xs font-semibold text-white">Subject: {generatedEmail.subject}</div>
              <p className="text-xs text-gray-300 whitespace-pre-wrap">{generatedEmail.body}</p>
            </div>
          )}
        </div>

        {/* Real-time Organization Chat Copilot */}
        <div className="p-6 rounded-2xl bg-card border border-border flex flex-col h-[560px]">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <MessageSquare className="w-4 h-4 text-accent-purple" />
            <h2 className="text-sm font-bold text-white">Organization Knowledge Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.role === 'user'
                    ? 'ml-auto bg-primary text-white'
                    : 'mr-auto bg-background border border-border text-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isChatting && (
              <div className="p-3 rounded-xl mr-auto bg-background border border-border text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>Querying organization intelligence...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about leads, accounts, or pipeline velocity..."
              className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isChatting}
              className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
