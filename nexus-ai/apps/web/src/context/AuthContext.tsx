'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, organizationName: string) => Promise<void>;
  switchOrg: (org: Organization) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = ApiClient.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await ApiClient.get('/auth/me');
        if (res.success && res.data) {
          setUser({
            id: res.data.id,
            email: res.data.email,
            fullName: res.data.fullName,
          });

          const orgs = (res.data.memberships || []).map((m: any) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            role: m.role,
          }));
          setOrganizations(orgs);

          const storedOrgId = ApiClient.getOrgId();
          const selected = orgs.find((o: any) => o.id === storedOrgId) || orgs[0] || null;
          setCurrentOrg(selected);
          if (selected) localStorage.setItem('nexus_org_id', selected.id);
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await ApiClient.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('nexus_access_token', res.data.tokens.accessToken);
      localStorage.setItem('nexus_refresh_token', res.data.tokens.refreshToken);
      localStorage.setItem('nexus_org_id', res.data.organization.id);

      setUser(res.data.user);
      setCurrentOrg(res.data.organization);
      setOrganizations(res.data.organizations || [res.data.organization]);
    }
  };

  const register = async (fullName: string, email: string, password: string, organizationName: string) => {
    const res = await ApiClient.post('/auth/register', { fullName, email, password, organizationName });
    if (res.success && res.data) {
      localStorage.setItem('nexus_access_token', res.data.tokens.accessToken);
      localStorage.setItem('nexus_refresh_token', res.data.tokens.refreshToken);
      localStorage.setItem('nexus_org_id', res.data.organization.id);

      setUser(res.data.user);
      setCurrentOrg(res.data.organization);
      setOrganizations([res.data.organization]);
    }
  };

  const switchOrg = (org: Organization) => {
    setCurrentOrg(org);
    localStorage.setItem('nexus_org_id', org.id);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('nexus_access_token');
    localStorage.removeItem('nexus_refresh_token');
    localStorage.removeItem('nexus_org_id');
    setUser(null);
    setCurrentOrg(null);
    setOrganizations([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentOrg,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        switchOrg,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
