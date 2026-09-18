# Empire CRM - Multi-Tenant SaaS Architecture

Empire CRM has been transformed into a true multi-tenant CRM SaaS / CRM Builder system capable of serving thousands of isolated workspace tenants while maintaining complete data security, customizability, and operational scalability.

---

## 1. Multi-Tenant Architecture Overview

Every database entity and operational workflow is partitioned by `tenantId`.

```
                  +-----------------------------------+
                  |         Platform Owner            |
                  |     (Level 1 Super Admin)         |
                  +-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+-------------------+                               +-------------------+
|  Tenant A         |                               |  Tenant B         |
|  (Acme Realty)    |                               |  (TechCorp Inc)   |
|  Slug: acme       |                               |  Slug: techcorp   |
|  Plan: PRO        |                               |  Plan: STARTER    |
+-------------------+                               +-------------------+
  |                                                   |
  +-- Custom Fields (15 types)                        +-- Custom Fields
  +-- Pipelines & Stages                              +-- Pipelines & Stages
  +-- Enabled Modules                                 +-- Enabled Modules
  +-- Users & Roles                                   +-- Users & Roles
  +-- Isolated CRM Data                               +-- Isolated CRM Data
```

---

## 2. Three-Tiered Access & Control System

1. **Level 1: Platform Owner Admin (`/api/v1/admin/*`)**
   - Access: Reserved exclusively for Platform Owner / SuperAdmin (`isPlatformOwner: true`).
   - Capabilities:
     - Global Platform Dashboard metrics (Total Tenants, Active, Trial, Suspended, MRR).
     - Workspace Provisioning with pre-built CRM industry templates.
     - Tenant activation, suspension, and deletion.
     - Subscription Plan configuration (`FREE`, `STARTER`, `PRO`, `BUSINESS`, `ENTERPRISE`).
     - System-wide Audit Logs.

2. **Level 2: Tenant Workspace Administrator (`/api/v1/tenant/*`)**
   - Access: Reserved for Tenant Admins (`TENANT_ADMIN` role within a workspace).
   - Capabilities:
     - Workspace Settings & White-Label Branding (Logo, Name, Primary Color).
     - Staff management (Users, Roles, Permissions).
     - CRM Builder Configuration (Modules, Custom Fields, Pipelines, Automations).
     - Developer Tools: SHA-256 Hashed API Keys (`sk_live_...`), Webhooks with HMAC SHA-256 signatures, and Integrations (Google, WhatsApp, Slack, Zapier).
     - Live Usage Metering & Subscription details.

3. **Level 3: End-User Staff (`/api/v1/*`)**
   - Access: Authenticated staff members scoped strictly to their own tenant workspace (`req.user.tenantId`).
   - Capabilities:
     - Core CRM workflows (Leads, Customers, Deals, Tasks, Follow-ups, Notes, Activities).
     - Extended Modules (Projects, Service Tickets, Sales Targets, Campaigns, HRMS, Call Logs, Staff Chat).
     - Global Unified Search within workspace boundaries.

---

## 3. Automatic Tenant Context Resolution Order

Requests reaching tenant endpoints undergo strict context resolution via `resolveTenant` middleware:

1. **Authenticated User Token**: Strictly enforces `req.user.tenantId` for authenticated non-platform owner users to eliminate header spoofing.
2. **Explicit Headers**: `X-Tenant-ID` or `X-Tenant-Slug` headers (used by Platform Owners or external integrations).
3. **Route Parameters**: `:tenantSlug` parameter in URL routes.
4. **Host / Subdomain Resolution**: Extracts tenant slug from subdomains (e.g., `acme.crm.empire.com`).
5. **Default Workspace**: Fallback to default `empire-crm` tenant for legacy endpoints.

---

## 4. Operational Protection & Security

- **Tenant Suspension Check**: Any request to a `SUSPENDED` workspace is immediately blocked with HTTP `403 Forbidden`:
  ```json
  {
    "success": false,
    "message": "Tenant workspace 'Acme Realty' is currently suspended. Please contact support."
  }
  ```
- **Plan Limits Guard**: Resource creation is validated against subscription plan limits (`maxUsers`, `maxLeads`, `maxCustomers`, `maxPipelines`, `maxAutomations`, `maxCustomFields`). Exceeding limits returns HTTP `403 Forbidden`:
  ```json
  {
    "success": false,
    "code": "PLAN_LIMIT_REACHED",
    "message": "Plan limit reached for LEAD. Maximum allowed: 500. Upgrade plan to continue."
  }
  ```
