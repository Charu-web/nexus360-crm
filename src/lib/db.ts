import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
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
console.log(`[DB] Resolved Database URL: ${dbUrl.startsWith('postgresql') ? 'PostgreSQL (Cloud)' : dbUrl}`);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
