import { Request, Response } from 'express';
import { config } from '../config';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { prisma } from '../lib/db';

const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export const getHealthStatus = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbError: string | null = null;
  let provider = 'SQLite';
  const configured = isSupabaseConfigured();

  // 1. Try local Prisma database check (SQLite or configured DATABASE_URL)
  const resolvedDbUrl = process.env.POSTGRES_PRISMA_URL ||
                        process.env.DATABASE_URL ||
                        process.env.POSTGRES_URL ||
                        process.env.STORAGE_POSTGRES_PRISMA_URL ||
                        process.env.STORAGE_DATABASE_URL ||
                        process.env.STORAGE_POSTGRES_URL ||
                        process.env.POSTGRES_URL_NON_POOLING ||
                        process.env.STORAGE_POSTGRES_URL_NON_POOLING;
  if (resolvedDbUrl) {
    try {
      await withTimeout(prisma.$queryRaw`SELECT 1`, 3000);
      dbStatus = 'connected';
      dbError = null;
      provider = resolvedDbUrl.startsWith('file:') ? 'SQLite' : 'PostgreSQL';
    } catch (prismaErr: any) {
      dbError = prismaErr.message;
    }
  }

  // 2. If Prisma failed or omitted, try Supabase REST check
  if (dbStatus !== 'connected' && configured) {
    try {
      const res1 = await withTimeout(
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        3000
      );

      if (
        !res1.error ||
        res1.status === 200 ||
        res1.status === 206 ||
        res1.error?.code === 'PGRST205'
      ) {
        dbStatus = 'connected';
        dbError = null;
        provider = 'Supabase PostgreSQL';
      } else {
        if (!dbError) dbError = res1.error?.message || 'Database query error';
      }
    } catch (err: any) {
      if (!dbError) dbError = err.message;
    }
  }

  const latencyMs = Date.now() - startTime;
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    server: {
      status: 'UP',
      port: config.port,
      environment: config.nodeEnv,
    },
    database: {
      status: dbStatus,
      provider,
      latencyMs,
      configured,
      ...(dbError ? { error: dbError } : {}),
    },
    timestamp: new Date().toISOString(),
  });
};
