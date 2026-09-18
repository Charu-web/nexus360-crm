# Nexus360 — Production Deployment & Cloud Infrastructure Guide

This guide provides end-to-end, production-tested deployment procedures for **Nexus360 Enterprise CRM**.

---

## 1. Production Architecture Overview

Nexus360 is engineered as a container-ready Node.js/Express service integrating Prisma ORM, strict multi-tenant schema partitioning, and a resilient multi-provider LLM abstraction layer.

```mermaid
graph TD
    subgraph Client & Edge Layer
        User[Enterprise Users / Browsers] --> CDN[Cloudflare / Edge CDN]
        CDN --> SSL[TLS 1.3 / SSL Termination]
    end

    subgraph Compute & Application Layer
        SSL --> NGINX[Nginx Reverse Proxy / Load Balancer]
        NGINX --> APP[Nexus360 Node.js Cluster :3000]
        APP --> Logger[Structured Production Logger]
        APP --> Auth[JWT & RBAC Tenant Guard]
        APP --> AI[LLM Factory: OpenAI / Anthropic / Fallback]
        APP --> Comms[WhatsApp / SMTP / Twilio Gateways]
    end

    subgraph Storage & Persistence Layer
        APP --> DB[(Managed PostgreSQL / SQLite Persistent Storage)]
        APP --> Vault[(Encrypted Document Storage Volume)]
    end
```

---

## 2. Cloud Hosting Provider Comparison & Recommendations

| Provider | Suitability | Supported DB | Pricing | Deployment Complexity | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Railway** | **Top Pick (Fastest & Simplest)** | Managed Postgres / SQLite Volume | Usage-based ($5/mo credits) | **Low** (1-Click Docker/Git) | ⭐ **Recommended for Rapid Production** |
| **Render** | **Top Pick (Zero Config SSL)** | Managed Postgres | $7/mo Web Service + $7/mo DB | **Low** (Native Node / Docker) | ⭐ **Recommended for Production SaaS** |
| **Fly.io** | **High Performance Edge** | Fly Postgres / NVMe Volume | Micro-tier available | **Medium** (`fly.toml` config) | Recommended for Global Low Latency |
| **AWS App Runner / ECS** | **Enterprise Scale** | AWS RDS PostgreSQL | Enterprise billing | **High** (IAM, VPC, RDS, ECS) | Recommended for Enterprise Compliance |
| **Bare-Metal VPS (Ubuntu)** | **Full Control & Low Cost** | Local Postgres / SQLite | $4-10/mo (Hetzner, DigitalOcean) | **Medium** (PM2, Nginx, Certbot) | Recommended for Self-Hosted Deployments |

---

## 3. Deployment Option A: Render (Recommended SaaS Provider)

Render provides native zero-downtime deployments, free managed SSL certificates, and managed PostgreSQL databases.

### Step 1: Provision Managed PostgreSQL Database
1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** $ightarrow$ **PostgreSQL**.
2. Name: `nexus360-db`
3. Region: Select your primary region (e.g. `Oregon (US West)` or `Frankfurt (EU)`).
4. Click **Create Database**.
5. Copy the **Internal Database URL** (e.g., `postgres://nexus_user:pass@dpg-xxxx:5432/nexus360_db`).

### Step 2: Deploy Nexus360 Web Service
1. In the Render Dashboard, click **New +** $ightarrow$ **Web Service**.
2. Connect your GitHub repository: `nexus360-crm`.
3. Configure settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm ci && npx prisma generate && npm run build`
   * **Start Command**: `node dist/server.js`
   * **Plan**: `Starter` ($7/mo) or higher
4. Under **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `PORT`: `3000`
   * `DATABASE_URL`: *(Paste Internal Database URL from Step 1)*
   * `JWT_SECRET`: *(Generate a secure 64-character random string)*
   * `CORS_ORIGIN`: `*`
   * `AI_PROVIDER`: `fallback-deterministic` *(or `openai` if API key provided)*
   * `OPENAI_API_KEY`: *(Optional external LLM key)*
5. Click **Create Web Service**.
6. Render will automatically build the application, run TypeScript compilation, and launch the service with a secure HTTPS URL (e.g., `https://nexus360.onrender.com`).

---

## 4. Deployment Option B: Railway (One-Click Container Deployment)

Railway provides instantaneous deployment from GitHub repositories with automatic environment detection.

### Step 1: Create Project & Database
1. In [Railway.app](https://railway.app/), click **New Project** $ightarrow$ **Provision PostgreSQL**.
2. Railway will spin up a managed PostgreSQL instance and provide the `DATABASE_URL` automatically.

### Step 2: Connect GitHub Repository
1. Click **New** $ightarrow$ **GitHub Repo** $ightarrow$ Select `nexus360-crm`.
2. Railway detects the `Dockerfile` automatically.
3. In the service **Variables** tab, ensure the following are set:
   * `PORT`: `3000`
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   * `JWT_SECRET`: `production_jwt_secret_nexus360_2026_enterprise`
   * `AI_PROVIDER`: `fallback-deterministic`
4. In the service **Settings** tab, click **Generate Domain** (e.g., `nexus360-production.up.railway.app`).
5. Deployment will complete automatically with live build logs and HTTPS enabled.

---

## 5. Deployment Option C: Docker & Docker Compose (Self-Hosted / Cloud VPS)

For self-hosted Linux VPS (Ubuntu 22.04 / Debian 12 / AWS EC2):

### Step 1: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y curl git
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Step 2: Clone & Configure
```bash
git clone https://github.com/organization/nexus360-crm.git /opt/nexus360
cd /opt/nexus360
cp .env.example .env
```
Edit `.env` with your production values.

### Step 3: Build & Launch Containers
```bash
docker-compose up -d --build
```

### Step 4: Verify Container Status & Logs
```bash
docker-compose ps
docker-compose logs -f
```

---

## 6. Database Migration & Initialization Procedures

To apply schema changes to a fresh production database without data loss:

### SQLite (Default Embedded Database)
```bash
# Push schema structure to local SQLite
npx prisma db push
# Seed initial roles, plans, and system admin
npx ts-node prisma/seed.ts
```

### PostgreSQL (Production Cloud Database)
```bash
# Set DATABASE_URL to your PostgreSQL connection string in .env
# Push schema to PostgreSQL instance
npx prisma db push

# Generate updated Prisma client bindings
npx prisma generate

# Seed baseline plans and organization admin
npx ts-node prisma/seed.ts
```

---

## 7. Production Security & Hardening Checklist

- [x] **No Secrets in Git**: `.env` and sensitive credentials excluded via `.gitignore`.
- [x] **Strict Multi-Tenancy**: Every query scoped by `tenantId` with database composite indexes.
- [x] **Rate Limiting**: Brute-force protection enabled on `/api/v1/auth/*` (max 50 attempts/15 mins) and general API (200 req/min).
- [x] **Security Headers**: `helmet` enabled to protect against clickjacking, MIME-sniffing, and XSS attacks.
- [x] **PII & Token Sanitization**: Production `requestLogger` filters passwords, tokens, and authorization headers from stdout.
- [x] **TLS/SSL Encryption**: HTTPS enforced at the cloud gateway / reverse proxy layer.

---

## 8. Post-Deployment Verification & Smoke Tests

After deployment, execute the following verification steps:

```bash
# 1. Health Check Endpoint
curl -I https://your-domain.com/health
# Expected: HTTP/1.1 200 OK

# 2. Nexus360 UI Entry Point
curl -I https://your-domain.com/menus
# Expected: HTTP/1.1 200 OK

# 3. API Health & Database Connectivity
curl https://your-domain.com/health
# Expected Response:
# {"status":"healthy","server":{"status":"UP","port":3000,"environment":"production"},"database":{"status":"connected"}}
```

### Critical User Flow Smoke Test Matrix:
1. **Authentication**: Navigate to `https://your-domain.com/menus`, log in as `admin@empirecrm.io` (`AdminPassword123!`).
2. **Unified Leads**: Create a new inbound lead and verify AI score calculation.
3. **CRM Builder**: Apply a blueprint (e.g. *Loans & DSA Banking*) and verify workspace updates.
4. **Customer 360**: Inspect customer profile and verify cross-domain tab aggregation.
5. **Document Vault**: Upload a document and verify storage linkage.
6. **Task & Calendar**: Schedule a task and verify calendar display.
7. **Multi-Domain Analytics**: Verify KPI calculations across all 4 verticals.
8. **Admin Audit Trail**: Verify that all actions are recorded with timestamps.
