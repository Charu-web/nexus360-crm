import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

class InMemoryTable<T extends { id?: string; [key: string]: any }> {
  private records: Map<string, T> = new Map();

  private matchCondition(record: T, key: string, condition: any): boolean {
    if (condition === undefined) return true;
    const value = record[key];

    if (condition === null) {
      return value === null;
    }

    if (typeof condition === 'object' && condition !== null) {
      if ('equals' in condition) return value === condition.equals;
      if ('not' in condition) return value !== condition.not;
      if ('in' in condition && Array.isArray(condition.in)) return condition.in.includes(value);
      if ('notIn' in condition && Array.isArray(condition.notIn)) return !condition.notIn.includes(value);
      if ('contains' in condition) {
        const valStr = String(value || '');
        const searchStr = String(condition.contains || '');
        if (condition.mode === 'insensitive') {
          return valStr.toLowerCase().includes(searchStr.toLowerCase());
        }
        return valStr.includes(searchStr);
      }
      if ('gte' in condition) return value >= condition.gte;
      if ('gt' in condition) return value > condition.gt;
      if ('lte' in condition) return value <= condition.lte;
      if ('lt' in condition) return value < condition.lt;
    }

    return value === condition;
  }

  private matchesWhere(record: T, where?: any): boolean {
    if (!where) return true;

    if (where.AND) {
      const conditions = Array.isArray(where.AND) ? where.AND : [where.AND];
      if (!conditions.every((cond: any) => this.matchesWhere(record, cond))) return false;
    }

    if (where.OR) {
      const conditions = Array.isArray(where.OR) ? where.OR : [where.OR];
      if (!conditions.some((cond: any) => this.matchesWhere(record, cond))) return false;
    }

    if (where.NOT) {
      const conditions = Array.isArray(where.NOT) ? where.NOT : [where.NOT];
      if (conditions.some((cond: any) => this.matchesWhere(record, cond))) return false;
    }

    for (const [key, condition] of Object.entries(where)) {
      if (key === 'AND' || key === 'OR' || key === 'NOT') continue;
      
      // Handle compound unique keys (e.g. organizationId_userId: { organizationId, userId })
      if (
        typeof condition === 'object' &&
        condition !== null &&
        !(key in record) &&
        !('equals' in condition) &&
        !('not' in condition) &&
        !('in' in condition) &&
        !('contains' in condition)
      ) {
        let allMatched = true;
        for (const [subKey, subCondition] of Object.entries(condition)) {
          if (!this.matchCondition(record, subKey, subCondition)) {
            allMatched = false;
            break;
          }
        }
        if (!allMatched) return false;
        continue;
      }

      if (!this.matchCondition(record, key, condition)) return false;
    }

    return true;
  }

  async findUnique(args: { where: any; include?: any }): Promise<T | null> {
    return this.findFirst(args);
  }

  async findFirst(args?: { where?: any; include?: any; orderBy?: any }): Promise<T | null> {
    const list = await this.findMany({ ...(args || {}), take: 1 });
    return list[0] || null;
  }

  async findMany(args?: { where?: any; include?: any; orderBy?: any; skip?: number; take?: number; select?: any }): Promise<T[]> {
    let result = Array.from(this.records.values()).filter((rec) => this.matchesWhere(rec, args?.where));

    if (args?.orderBy) {
      const orderKeys = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
      result.sort((a: any, b: any) => {
        for (const order of orderKeys) {
          const [key, dir] = Object.entries(order)[0] as [string, 'asc' | 'desc'];
          if (a[key] < b[key]) return dir === 'asc' ? -1 : 1;
          if (a[key] > b[key]) return dir === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (args?.skip) {
      result = result.slice(args.skip);
    }
    if (args?.take !== undefined) {
      result = result.slice(0, args.take);
    }

    // Clone results
    return result.map((r) => ({ ...r }));
  }

  async create(args: { data: any; include?: any }): Promise<T> {
    const id = args.data.id || crypto.randomUUID();
    const now = new Date();
    const newRecord = {
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      ...args.data,
    } as unknown as T;
    this.records.set(id, newRecord);
    return { ...newRecord };
  }

  async createMany(args: { data: any[] }): Promise<{ count: number }> {
    let count = 0;
    for (const item of args.data) {
      await this.create({ data: item });
      count++;
    }
    return { count };
  }

  async update(args: { where: any; data: any; include?: any }): Promise<T> {
    const existing = await this.findFirst({ where: args.where });
    if (!existing || !existing.id) {
      throw new Error('Record to update not found');
    }

    const updated = {
      ...existing,
      ...args.data,
      updatedAt: new Date(),
    };
    this.records.set(existing.id, updated);
    return { ...updated };
  }

  async updateMany(args: { where?: any; data: any }): Promise<{ count: number }> {
    const records = await this.findMany({ where: args.where });
    for (const rec of records) {
      if (rec.id) {
        this.records.set(rec.id, {
          ...rec,
          ...args.data,
          updatedAt: new Date(),
        });
      }
    }
    return { count: records.length };
  }

  async delete(args: { where: any }): Promise<T> {
    const existing = await this.findFirst({ where: args.where });
    if (!existing || !existing.id) {
      throw new Error('Record to delete not found');
    }
    this.records.delete(existing.id);
    return existing;
  }

  async deleteMany(args?: { where?: any }): Promise<{ count: number }> {
    if (!args?.where || Object.keys(args.where).length === 0) {
      const count = this.records.size;
      this.records.clear();
      return { count };
    }
    const matching = await this.findMany({ where: args.where });
    for (const item of matching) {
      if (item.id) this.records.delete(item.id);
    }
    return { count: matching.length };
  }

  async count(args?: { where?: any }): Promise<number> {
    const matches = await this.findMany({ where: args?.where });
    return matches.length;
  }

  async aggregate(args?: any): Promise<any> {
    const records = await this.findMany({ where: args?.where });
    let sumEstimatedValue = 0;
    for (const rec of records) {
      sumEstimatedValue += Number((rec as any).estimatedValue || 0);
    }
    return {
      _count: { id: records.length },
      _sum: { estimatedValue: sumEstimatedValue },
      _avg: { estimatedValue: records.length > 0 ? sumEstimatedValue / records.length : 0 },
    };
  }

  async groupBy(args: { by: string[]; where?: any; _count?: any }): Promise<any[]> {
    const records = await this.findMany({ where: args?.where });
    const groups = new Map<string, any>();
    const groupKeyName = args.by[0];

    for (const rec of records) {
      const keyVal = (rec as any)[groupKeyName];
      if (!groups.has(keyVal)) {
        groups.set(keyVal, {
          [groupKeyName]: keyVal,
          _count: { id: 0, _all: 0 },
        });
      }
      groups.get(keyVal)._count.id += 1;
      groups.get(keyVal)._count._all += 1;
    }
    return Array.from(groups.values());
  }
}

class InMemoryPrismaClient {
  user = new InMemoryTable<any>();
  organization = new InMemoryTable<any>();
  organizationMember = new InMemoryTable<any>();
  refreshToken = new InMemoryTable<any>();
  lead = new InMemoryTable<any>();
  contact = new InMemoryTable<any>();
  company = new InMemoryTable<any>();
  task = new InMemoryTable<any>();
  activity = new InMemoryTable<any>();
  document = new InMemoryTable<any>();
  documentChunk = new InMemoryTable<any>();
  workflow = new InMemoryTable<any>();
  workflowExecution = new InMemoryTable<any>();
  notification = new InMemoryTable<any>();
  auditLog = new InMemoryTable<any>();
  aIConversation = new InMemoryTable<any>();
  aIMessage = new InMemoryTable<any>();
  aiConversation = new InMemoryTable<any>();
  aiMessage = new InMemoryTable<any>();

  async $queryRaw(query: any, ...args: any[]): Promise<any> {
    return [{ result: 1 }];
  }

  async $transaction(fnOrArray: any): Promise<any> {
    if (typeof fnOrArray === 'function') {
      return fnOrArray(this);
    }
    if (Array.isArray(fnOrArray)) {
      const res = [];
      for (const item of fnOrArray) {
        res.push(await item);
      }
      return res;
    }
    return fnOrArray;
  }

  async $connect() {
    return Promise.resolve();
  }

  async $disconnect() {
    return Promise.resolve();
  }
}

// In-memory relational enricher for nested includes
const inMemory = new InMemoryPrismaClient();

// Support Document Creation with nested chunks
const originalDocumentCreate = inMemory.document.create.bind(inMemory.document);
inMemory.document.create = async (args: any) => {
  const chunksData = args.data?.chunks?.create;
  const docData = { ...args.data };
  delete docData.chunks;
  const doc = await originalDocumentCreate({ ...args, data: docData });

  if (chunksData && Array.isArray(chunksData)) {
    for (const chunk of chunksData) {
      await inMemory.documentChunk.create({
        data: {
          ...chunk,
          documentId: doc.id,
          organizationId: doc.organizationId,
        },
      });
    }
  }
  return doc;
};

// Support DocumentChunk relation to Document
const originalDocChunkFindMany = inMemory.documentChunk.findMany.bind(inMemory.documentChunk);
inMemory.documentChunk.findMany = async (args: any) => {
  const list = await originalDocChunkFindMany(args);
  if (args?.include?.document) {
    return Promise.all(
      list.map(async (item: any) => {
        const doc = await inMemory.document.findUnique({ where: { id: item.documentId } });
        return { ...item, document: doc };
      })
    );
  }
  return list;
};

// Support RefreshToken relation to User
const originalRefreshTokenFindUnique = inMemory.refreshToken.findUnique.bind(inMemory.refreshToken);
inMemory.refreshToken.findUnique = async (args: any) => {
  const token = await originalRefreshTokenFindUnique(args);
  if (!token) return null;
  if (args?.include?.user) {
    const user = await inMemory.user.findUnique({
      where: { id: token.userId },
      include: args.include.user.include,
    });
    return { ...token, user };
  }
  return token;
};

// Wrap find methods to support standard relations: user, organization, organizationMember
const originalUserFindUnique = inMemory.user.findUnique.bind(inMemory.user);
inMemory.user.findUnique = async (args: any) => {
  const user = await originalUserFindUnique(args);
  if (!user) return null;
  if (args?.include?.memberships) {
    const memberships = await inMemory.organizationMember.findMany({
      where: { userId: user.id },
    });
    const enrichedMemberships = await Promise.all(
      memberships.map(async (m) => ({
        ...m,
        organization: await inMemory.organization.findUnique({ where: { id: m.organizationId } }),
      }))
    );
    return { ...user, memberships: enrichedMemberships };
  }
  return user;
};

const originalOrgMemberFindMany = inMemory.organizationMember.findMany.bind(inMemory.organizationMember);
inMemory.organizationMember.findMany = async (args: any) => {
  const members = await originalOrgMemberFindMany(args);
  if (args?.include?.user || args?.include?.organization) {
    return Promise.all(
      members.map(async (m) => ({
        ...m,
        user: args.include?.user ? await inMemory.user.findUnique({ where: { id: m.userId } }) : undefined,
        organization: args.include?.organization ? await inMemory.organization.findUnique({ where: { id: m.organizationId } }) : undefined,
      }))
    );
  }
  return members;
};

const originalOrgMemberFindFirst = inMemory.organizationMember.findFirst.bind(inMemory.organizationMember);
inMemory.organizationMember.findFirst = async (args: any) => {
  const m = await originalOrgMemberFindFirst(args);
  if (!m) return null;
  if (args?.include?.organization) {
    const org = await inMemory.organization.findUnique({ where: { id: m.organizationId } });
    return { ...m, organization: org };
  }
  return m;
};

export const prisma: any = (process.env.USE_REAL_PRISMA === 'true')
  ? new PrismaClient()
  : inMemory;
