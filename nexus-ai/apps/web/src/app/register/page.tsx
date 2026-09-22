'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Building, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(fullName, email, password, organizationName);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-primary/30">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">NexusAI</h1>
            <p className="text-xs text-muted">Multi-Tenant Onboarding</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">Create your Enterprise Workspace</h2>
        <p className="text-xs text-muted mb-6">14-day free trial with full AI capabilities enabled.</p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              placeholder="e.g. Alex Reynolds"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Company / Organization Name</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              placeholder="e.g. Apex Global Solutions"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              placeholder="alex@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password (min 8 chars, 1 uppercase, 1 number)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
                <span>Provision Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
