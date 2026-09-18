# Empire CRM - CRM Builder Specification

Empire CRM includes a full-fledged CRM Builder engine allowing tenants to customize modules, fields, sales pipelines, event automations, webhooks, and public lead capture forms without writing any code.

---

## 1. Dynamic Tenant Modules (`/api/v1/modules`)

Tenants can toggle CRM module availability based on business needs:
- `LEADS` (System Required)
- `CUSTOMERS` (System Required)
- `TASKS` (System Required)
- `REPORTS` (System Required)
- `CONTACTS`
- `DEALS`
- `PROJECTS`
- `SERVICES`
- `TARGETS`
- `CAMPAIGNS`
- `HRMS`
- `CALLS`
- `CHAT`

*Note: System-required modules cannot be disabled or deleted.*

---

## 2. Custom Fields Engine (`/api/v1/custom-fields`)

Tenants can extend standard entities (`LEAD`, `CONTACT`, `CUSTOMER`, `DEAL`, `TASK`, `PROJECT`, `SERVICE`) with custom attributes across 15 supported field types:

| Field Type | Supported Properties | Usage Example |
| :--- | :--- | :--- |
| `TEXT` | `isRequired`, `isUnique`, `defaultValue` | Short Text input |
| `LONG_TEXT` | `isRequired` | Rich text / Notes |
| `NUMBER` | `validation`, `defaultValue` | Integer / Decimal values |
| `CURRENCY` | `defaultValue` | Monetary values (e.g. Budget) |
| `DATE` | `isRequired` | Simple Date (YYYY-MM-DD) |
| `DATETIME` | `isRequired` | ISO Timestamp |
| `BOOLEAN` | `defaultValue` | Checkbox (true / false) |
| `EMAIL` | `isUnique`, `isRequired` | Email validation |
| `PHONE` | `isUnique`, `isRequired` | Telephone number |
| `URL` | `validation` | Website link |
| `DROPDOWN` | `options` (JSON Array) | Single choice select |
| `MULTI_SELECT` | `options` (JSON Array) | Multi-select checkboxes |
| `USER` | `isRequired` | Workspace staff member |
| `RELATION` | `validation` | Relation to another entity |
| `FILE` | `validation` | Upload attachment reference |

---

## 3. Pipelines & Multi-Stage Sales Funnels (`/api/v1/pipelines`)

- Supports unlimited sales pipelines per tenant.
- Customizable pipeline stages with visual color tags, win probability percentages, and closed-won / closed-lost flags.
- Real-time pipeline stage transitions trigger webhooks and automations.

---

## 4. Event Automation Engine (`/api/v1/automations`)

Trigger event-based rules upon CRM state changes:
- **Supported Triggers**: `lead.created`, `lead.updated`, `deal.created`, `task.overdue`, `customer.onboarded`.
- **Supported Actions**:
  - `create_followup`: Automatically schedules follow-up tasks for agents.
  - `create_task`: Automatically assigns high-priority outreach tasks.
  - `send_webhook`: Dispatches real-time event notifications to external webhooks.
- **Dry-Run Testing Endpoint**: `POST /api/v1/automations/:id/test` simulates condition evaluation against a sample payload without mutating database state.

---

## 5. Public Lead Capture Forms (`/api/public/forms/*`)

- Public form endpoints allow non-authenticated website visitors to submit leads directly into a tenant's workspace.
- **Security & Anti-Spam Protection**:
  - Honeypot form field validation.
  - IP-based rate limiting.
  - Automatic duplication checks by email and phone number.
