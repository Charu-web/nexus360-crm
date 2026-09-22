'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  FileText,
  Bot,
  Workflow,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Leads & CRM', href: '/crm/leads', icon: Users },
  { label: 'AI Sales Assistant', href: '/ai/assistant', icon: Bot, badge: 'AI' },
  { label: 'Document RAG', href: '/documents', icon: FileText, badge: 'RAG' },
  { label: 'Workflows', href: '/workflows', icon: Workflow, badge: 'Auto' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Team & Roles', href: '/team', icon: Building2 },
  { label: 'Audit Logs', href: '/audit', icon: ShieldCheck },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currentOrg, organizations, switchOrg, logout, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on login or register, don't show the dashboard shell
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted text-sm font-medium">Initializing NexusAI Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-border shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30">
            N
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">NexusAI</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-accent-purple/20 text-accent-purple rounded border border-accent-purple/30">PRO</span>
          </div>
        </div>

        {/* Organization Switcher */}
        <div className="p-4 border-b border-border relative">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-gray-600 transition text-left"
          >
            <div className="truncate">
              <div className="text-xs text-muted font-medium">Workspace</div>
              <div className="text-sm font-semibold text-white truncate">{currentOrg?.name || 'Select Org'}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted shrink-0" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-2 text-[11px] text-muted font-semibold uppercase tracking-wider">Switch Organization</div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrg(org);
                    setIsOrgDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/5 transition ${
                    currentOrg?.id === org.id ? 'text-primary font-bold bg-primary/10' : 'text-gray-300'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  <span className="text-[10px] uppercase text-muted">{org.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-accent-purple/30 text-accent-purple flex items-center justify-center font-bold text-xs shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.fullName}</div>
              <div className="text-[11px] text-muted truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-sidebar border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-sm font-bold">N</div>
            <span>NexusAI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 text-muted">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};
