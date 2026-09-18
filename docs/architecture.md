# Nexus360 System Architecture Documentation

## 1. High-Level Architectural Topology

Nexus360 employs a modular, multi-tenant Service-Oriented Architecture (SOA) designed for scale, resilience, and strict data isolation.

```mermaid
graph TD
    Client[Browser Client / Mobile Responsive SPA]
    
    subgraph Gateway & Middleware Layer
        MW1[Security Headers - Helmet]
        MW2[Rate Limiting - Express Rate Limit]
        MW3[Tenant Isolation & JWT Auth Guard]
        MW4[Structured Request Logger]
    end

    subgraph Controller & Routing Layer
        R1[Unified Leads Controller]
        R2[Customer 360 Controller]
        R3[CRM Builder & Blueprint Engine]
        R4[DSA Loan Banking Controller]
        R5[Real Estate & Property Controller]
        R6[Communications & Vault Controller]
        R7[Tasks & Calendar Controller]
        R8[Analytics & Audit Controller]
    end

    subgraph Service & AI Layer
        AI[LLM Provider Abstraction Layer]
        WF[Autonomous Workflow Execution Engine]
        COM[Multi-Channel Dispatcher WhatsApp/SMTP/SMS]
    end

    subgraph Persistence Layer
        DB[(Prisma Relational Database)]
    end

    Client --> MW1 --> MW2 --> MW3 --> MW4
    MW4 --> R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8
    R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 --> AI & WF & COM
    AI & WF & COM --> DB
    R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 --> DB
```

---

## 2. Multi-Tenancy & Data Isolation Model

Every database query and mutation is strictly partitioned by `tenantId`.

* **Tenant Identification**: Extracted from validated JWT tokens or `X-Tenant-ID` header.
* **Data Isolation**: All 63 Prisma models enforce foreign key relationships to `Tenant` or include composite indexes `@@index([tenantId])` and `@@unique([tenantId, entityId])`.
* **RBAC Hierarchy**:
  - `TENANT_ADMIN`: Complete control over tenant settings, blueprints, team users, and pipelines.
  - `MANAGER`: Branch management, workflow creation, deal approvals.
  - `UNDERWRITER`: Financial / credit assessment, KYC verification, loan sanctioning.
  - `AGENT`: Lead intake, contact updates, task completion, messaging.

---

## 3. LLM Provider Abstraction Architecture

Nexus360 decouples business logic from external LLM vendors through a unified provider contract:

```typescript
export interface ILLMProvider {
  name: string;
  model: string;
  complete(prompt: string, options?: LLMOptions): Promise<LLMCompletionResult>;
  generateStructured<T>(prompt: string, schema: any): Promise<T>;
}
```

* **Factory Selection**: Dynamically instantiated via `AI_PROVIDER` environment variable.
* **Deterministic Fallback Engine**: If no OpenAI/Anthropic API keys are provided, Nexus360 seamlessly routes queries through internal rule-based heuristic engines, guaranteeing 100% operational uptime and zero unexpected downtime.

---

## 4. Autonomous Workflow Engine

```mermaid
sequenceDiagram
    participant Event as Inbound Event (Lead / Loan / Booking)
    participant Engine as Workflow Execution Engine
    participant Condition as Evaluator (AND/OR Logic)
    participant Action as Action Dispatcher
    participant Audit as Immutable Audit Log

    Event->>Engine: Trigger Event Dispatched
    Engine->>Condition: Evaluate Filters (Score >= 70, Vertical = LOAN)
    Condition-->>Engine: Condition Satisfied (Boolean true)
    Engine->>Action: Execute Action Chain (Assign User, Create Task, Send Alert)
    Action->>Audit: Record Execution with Millisecond Timestamps
```
