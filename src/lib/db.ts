import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  const url = process.env.POSTGRES_PRISMA_URL ||
              process.env.DATABASE_URL ||
              process.env.POSTGRES_URL ||
              process.env.STORAGE_POSTGRES_PRISMA_URL ||
              process.env.STORAGE_DATABASE_URL ||
              process.env.STORAGE_POSTGRES_URL ||
              process.env.POSTGRES_URL_NON_POOLING ||
              process.env.STORAGE_POSTGRES_URL_NON_POOLING;
  if (url) {
    return url;
  }
  const candidates = [
    path.resolve(process.cwd(), 'prisma/dev.db'),
    path.resolve(process.cwd(), 'dev.db'),
    path.resolve(__dirname, '../../prisma/dev.db'),
    path.resolve(__dirname, '../prisma/dev.db'),
    path.resolve(__dirname, '../../../prisma/dev.db'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return `file:${c}`;
    }
  }
  return 'file:./prisma/dev.db';
}

const dbUrl = getDatabaseUrl();
console.log(`[DB] Resolved Database URL: ${dbUrl.startsWith('postgresql') || dbUrl.startsWith('postgres') ? 'PostgreSQL (Cloud)' : dbUrl}`);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
