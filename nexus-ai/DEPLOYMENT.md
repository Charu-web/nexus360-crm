# NexusAI Enterprise SaaS — Production Deployment Runbook

## 1. Production Architecture Overview

```
                        [ Internet / User Browser ]
                                     │
                                     ▼
                    [ Reverse Proxy / Cloudflare / NGINX ]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    [ Next.js 14 Web Frontend ]            [ Express.js REST API ]
       (Port 3000 / SSR & RSC)                 (Port 4000)
                 │                                       │
                 └───────────────┬───────────────────────┘
                                 │
                 ┌───────────────┼───────────────┬───────────────────────┐
                 ▼               ▼               ▼                       ▼
       [ PostgreSQL + pgvector ] [ Redis Cache ] [ BullMQ Worker ]  [ Python AI Service ]
              (Port 5432)           (Port 6379)    (Background Jobs)      (Port 8000)
                                                         │                       │
                                                         └───────────┬───────────┘
                                                                     ▼
                                                          [ External LLM Provider ]
                                                          (OpenAI / Anthropic API)
```

---

## 2. Required Production Environment Variables

| Variable | Description | Example / Production Format |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `production` |
| `PORT` | API listening port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string with pgvector support | `postgresql://user:password@db-host:5432/nexus_ai?schema=public&sslmode=require` |
| `REDIS_URL` | Redis connection URI for caching and BullMQ queues | `redis://default:password@redis-host:6379` |
| `JWT_SECRET` | 64-character cryptographically secure token signing key | *Generate with `openssl rand -hex 32`* |
| `JWT_REFRESH_SECRET` | 64-character cryptographically secure refresh signing key | *Generate with `openssl rand -hex 32`* |
| `CORS_ORIGIN` | Allowed web origins (comma-separated for multiple) | `https://nexusai.io,https://app.nexusai.io` |
| `NEXT_PUBLIC_API_URL` | Public-facing API URL accessible from browser | `https://api.nexusai.io/api/v1` |
| `AI_SERVICE_URL` | Internal URL for Python AI microservice | `http://ai-service:8000` |
| `OPENAI_API_KEY` | OpenAI API key for LLM inference | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key (optional fallback) | `sk-ant-...` |

---

## 3. Step-by-Step Deployment Order

### Step 1: Database Provisioning (PostgreSQL + pgvector)
1. Deploy a managed PostgreSQL 15+ database (e.g. Neon, AWS RDS, Supabase).
2. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run Prisma database migrations to apply the relational schema:
   ```bash
   npx prisma migrate deploy
   ```
4. (Optional) Run initial demo seed:
   ```bash
   npx prisma db seed
   ```

### Step 2: Redis Provisioning
1. Provision a high-availability Redis 7+ instance (e.g. Upstash, AWS ElastiCache).
2. Verify connectivity with `redis-cli ping` $\rightarrow$ `PONG`.

### Step 3: Python AI Microservice Deployment
1. Build and run the FastAPI container:
   ```bash
   docker build -t nexus-ai-service -f docker/Dockerfile.ai-service .
   docker run -d --name nexus-ai-service -p 8000:8000 --env-file .env nexus-ai-service
   ```
2. Verify AI Health: `curl http://localhost:8000/health` $\rightarrow$ `{"status": "healthy"}`.

### Step 4: Backend REST API Deployment
1. Build and launch the Express API service:
   ```bash
   npm run build --workspace=@nexus-ai/api
   npm run start --workspace=@nexus-ai/api
   ```
2. Check Health Probe: `curl http://localhost:4000/health` $\rightarrow$ `{"status": "ok"}`.

### Step 5: BullMQ Background Worker Deployment
1. Launch the background job worker process:
   ```bash
   npm run worker --workspace=@nexus-ai/api
   ```

### Step 6: Next.js Frontend Deployment
1. Ensure `NEXT_PUBLIC_API_URL` is set to your production API URL.
2. Build and start Next.js App Router:
   ```bash
   npm run build --workspace=@nexus-ai/web
   npm run start --workspace=@nexus-ai/web
   ```

---

## 4. Single-Command Docker Deployment

To launch the complete high-availability stack in Docker:

```bash
docker compose -f docker-compose.production.yml up -d --build
```

---

## 5. Production Health & Verification Checklist

- [ ] **Health Endpoint**: `https://api.yourdomain.com/health` returns HTTP 200 `status: ok`
- [ ] **Frontend Routes**: `/login`, `/dashboard`, `/crm/leads`, `/ai/assistant`, `/documents`, `/workflows`, `/analytics`, `/team`, `/audit`
- [ ] **Database Connection Pool**: Verified active and healthy
- [ ] **Tenant Isolation**: Confirmed cross-tenant data requests return HTTP 404/403
- [ ] **SSL/TLS**: HTTPS enforced with HSTS headers enabled
