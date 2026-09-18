import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  const candidates = [
    '/home/u490416745/domains/businesscrm.empireitxpert.in/public_html/prisma/dev.db',
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
  return process.env.DATABASE_URL || 'file:./prisma/dev.db';
}

const dbUrl = getDatabaseUrl();
console.log(`[DB] Resolved SQLite Database URL: ${dbUrl}`);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
