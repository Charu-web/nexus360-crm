'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Bot, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('alex.owner@nexusai.io');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-primary/30">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">NexusAI</h1>
            <p className="text-xs text-muted">AI Business Operations Platform</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">Sign in to your workspace</h2>
        <p className="text-xs text-muted mb-6">Enter your organizational credentials to continue</p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-300">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-fill */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-[11px] text-muted font-medium mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
            <span>Click to Autofill Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => autofillDemo('alex.owner@nexusai.io')}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-border rounded text-[11px] font-medium text-gray-300 transition"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('sarah.manager@nexusai.io')}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-border rounded text-[11px] font-medium text-gray-300 transition"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('david.rep@nexusai.io')}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-border rounded text-[11px] font-medium text-gray-300 transition"
            >
              Sales Rep
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted">
          Need a new organization?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Create Enterprise Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
