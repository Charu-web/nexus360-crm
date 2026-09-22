# NexusAI — Enterprise AI-Powered SaaS Platform

NexusAI is a full-stack, enterprise-grade AI Business Operations Platform combining CRM, AI sales assistance, document intelligence, RAG-based knowledge management, workflow automation, and multi-tenant organization management.

---

## 🌟 Key Features

- **Multi-Tenant Architecture**: Strict query-level and middleware tenant isolation, multi-org support, role-based access control (`OWNER`, `ADMIN`, `MANAGER`, `EMPLOYEE`, `VIEWER`).
- **AI CRM & Lead Intelligence**: Lead, Company, Contact, and Task management with algorithmic & LLM-driven predictive lead scoring (0–100) and actionable recommendations.
- **Context-Aware AI Sales Assistant**: Copilot capable of summarizing past interactions, identifying objections, and generating customized follow-up proposals.
- **Document Intelligence & RAG Knowledge Base**: Multi-format document upload (PDF, TXT, DOCX, CSV), automatic text extraction, chunking, vector embeddings with pgvector, and citation-backed Q&A.
- **Visual AI Workflow Automation**: Trigger-condition-action workflow engine executed reliably with step logging and notification dispatch.
- **Deep Analytics & Observability**: Real database aggregations, stage conversion funnels, pipeline forecasting, immutable audit logs, and `/health` probes.

---

## 🏗️ Monorepo Structure

```
nexus-ai/
├── apps/
│   ├── web/            # Next.js 14+ App Router, Tailwind CSS, Lucide, Recharts
│   ├── api/            # Node.js Express REST API, Prisma ORM, BullMQ Worker
│   └── ai-service/     # FastAPI Python AI Service, LangChain, Embeddings, RAG
├── packages/
│   ├── types/          # Shared TypeScript domain interfaces & DTOs
│   └── validation/     # Shared Zod validation schemas
├── prisma/             # Schema, migrations & database seeder
├── docker/             # Production Dockerfiles (api, web, worker, ai-service)
├── docker-compose.production.yml # Multi-container production deployment stack
└── DEPLOYMENT.md       # Production runbook & environment variable specifications
```

---

## 🚢 Production Deployment

### 1. Production Build & Preparation
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build all monorepo workspaces
npm run build
```

### 2. Database Migration
```bash
# Apply migrations to production PostgreSQL database
npx prisma migrate deploy
```

### 3. Start Production Services

- **Backend REST API**:
  ```bash
  npm run start --workspace=@nexus-ai/api
  ```
- **BullMQ Background Worker**:
  ```bash
  npm run worker --workspace=@nexus-ai/api
  ```
- **Next.js Web Frontend**:
  ```bash
  npm run start --workspace=@nexus-ai/web
  ```
- **Python AI Microservice**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port 8000
  ```

### 4. Single-Command Production Docker Deployment
```bash
docker compose -f docker-compose.production.yml up -d --build
```

---

## 🧪 Automated Verification Test Suite

Run the full 16-phase production verification suite:
```bash
npx ts-node --project apps/api/tsconfig.json apps/api/test_production_suite.ts
```
