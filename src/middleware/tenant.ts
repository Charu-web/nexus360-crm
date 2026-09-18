import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: {
        id: string;
        name: string;
        slug: string;
        domain: string | null;
        status: string;
        industry: string | null;
        companySize: string | null;
        country: string | null;
        template: string | null;
        logo: string | null;
        primaryColor: string | null;
      };
      isPlatformOwner?: boolean;
    }
  }
}

export interface TenantRequest extends Request {
  tenantId?: string;
}

export const resolveTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let tenantIdOrSlug: string | undefined;

    // 1. For Authenticated Tenant Users: Strictly enforce user.tenantId (prevent header spoofing)
    if (req.user && !req.user.isPlatformOwner && req.user.tenantId) {
      tenantIdOrSlug = req.user.tenantId;
    } else if (!req.user && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        if (decoded && decoded.tenantId && !decoded.isPlatformOwner) {
          tenantIdOrSlug = decoded.tenantId;
        }
      } catch {}
    }

    if (!tenantIdOrSlug) {
      // 2. Explicit Header Override (e.g. X-Tenant-ID for Platform Owners or public endpoints)
      const headerVal = req.headers['x-tenant-id'] || req.headers['x-tenant-slug'];
      tenantIdOrSlug = Array.isArray(headerVal) ? headerVal[0] : headerVal;

      // 3. Request URL params override
      if (!tenantIdOrSlug && req.params.tenantSlug) {
        tenantIdOrSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
      }

      // 4. Subdomain / Host Resolution (e.g. "acme-corp.crmbusiness.empireitxpert.in")
      if (!tenantIdOrSlug && req.headers.host) {
        const rawHost = req.headers.host;
        const host = (Array.isArray(rawHost) ? rawHost[0] : rawHost).toLowerCase();
        const hostname = host.split(':')[0];
        const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
        
        if (!isIpAddress && hostname !== 'localhost') {
          const parts = hostname.split('.');
          if (parts.length >= 3 && parts[0] !== 'www') {
            tenantIdOrSlug = parts[0];
          }
        }
      }

      // 5. Default Main Tenant Fallback ("empire-crm")
      if (!tenantIdOrSlug) {
        tenantIdOrSlug = 'empire-crm';
      }
    }

    if (!tenantIdOrSlug) {
      throw new AppError('Tenant workspace context not specified.', 400);
    }

    // Query Tenant by ID or Slug or Custom Domain
    let tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantIdOrSlug },
          { slug: tenantIdOrSlug.toLowerCase() },
          { domain: tenantIdOrSlug.toLowerCase() },
        ],
      },
    });

    // Fallback to default primary workspace tenant if subdomain is not a separate tenant slug
    if (!tenant) {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: 'businesscrm' },
            { slug: 'bussniescrm' },
            { slug: 'crmbusiness' },
            { slug: 'dsacrm' },
            { slug: 'empire-crm' },
            { status: 'ACTIVE' },
          ],
        },
      });
    }

    if (!tenant) {
      throw new AppError(`Tenant workspace '${tenantIdOrSlug}' not found`, 404);
    }

    if (tenant.status === 'SUSPENDED') {
      throw new AppError(`Tenant workspace '${tenant.name}' is currently suspended. Please contact support.`, 403);
    }

    req.tenantId = tenant.id;
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      status: tenant.status,
      industry: tenant.industry,
      companySize: tenant.companySize,
      country: tenant.country,
      template: tenant.template,
      logo: tenant.logo,
      primaryColor: tenant.primaryColor,
    };

    req.isPlatformOwner = req.user?.isPlatformOwner || false;

    next();
  } catch (error) {
    next(error);
  }
};
