'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Upload, Search, Trash2, Sparkles, BookOpen, AlertCircle, FileCheck } from 'lucide-react';

export default function DocumentsRAGPage() {
  const { currentOrg } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RAG Query state
  const [query, setQuery] = useState('');
  const [ragResult, setRagResult] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await ApiClient.get('/documents');
      if (res.success) setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentOrg]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const token = ApiClient.getToken();
      const orgId = ApiClient.getOrgId();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Organization-ID': orgId || '',
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchDocs();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRAGSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsQuerying(true);
    setRagResult(null);

    try {
      const res = await ApiClient.post('/rag/query', { query });
      if (res.success && res.data) {
        setRagResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'RAG Search error');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document from the knowledge base?')) return;
    try {
      await ApiClient.delete(`/documents/${id}`);
      await fetchDocs();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span>Document Intelligence & RAG Knowledge Base</span>
          </h1>
          <p className="text-xs text-muted">
            Upload policies, compliance whitepapers, or contracts to enable citation-backed AI Q&A.
          </p>
        </div>

        <label className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/20 transition cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Ingesting...' : 'Upload Knowledge Document'}</span>
          <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt,.csv" className="hidden" />
        </label>
      </div>

      {/* RAG Search Engine */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-purple" />
          <h2 className="text-sm font-bold text-white">Ask Organization Knowledge Base</h2>
        </div>

        <form onSubmit={handleRAGSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What are our compliance certifications and data encryption policies?"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isQuerying}
            className="px-4 py-2.5 bg-accent-purple hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            {isQuerying ? 'Searching...' : 'Search with Citations'}
          </button>
        </form>

        {/* RAG Answer Display */}
        {ragResult && (
          <div className="p-4 rounded-xl bg-background border border-border space-y-3 animate-fadeIn">
            <div className="text-xs font-bold text-accent-purple uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Verified Answer
            </div>
            <p className="text-xs text-gray-200 whitespace-pre-wrap">{ragResult.answer}</p>

            {ragResult.sources && ragResult.sources.length > 0 && (
              <div className="pt-3 border-t border-border/80">
                <span className="text-[11px] font-bold text-muted uppercase block mb-2">Sources Referenced:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ragResult.sources.map((src: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-card border border-border/70 text-xs">
                      <div className="font-semibold text-primary truncate">{src.documentName}</div>
                      <div className="text-[11px] text-muted line-clamp-2 mt-1">{src.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Library Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-white">Ingested Knowledge Documents</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-sidebar/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="p-3.5 pl-5">Document Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Chunks</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">Loading documents...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">No documents uploaded yet.</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5 pl-5 font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-border text-muted">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted">{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">{doc.chunksCount} chunks</td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-muted hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
