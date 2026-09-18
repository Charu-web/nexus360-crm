# Nexus360 REST API Reference

Base URL: `http://localhost:3000/api/v1`

All requests except authentication endpoints require the `Authorization: Bearer <JWT_TOKEN>` header and optional `X-Tenant-ID: <TENANT_ID>` header.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
Authenticates a user and generates access credentials.
* **Request**:
  ```json
  {
    "email": "admin@empirecrm.io",
    "password": "AdminPassword123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "fullName": "Admin User", "email": "admin@empirecrm.io" },
    "tenant": { "id": "tenant-empire-default", "name": "Empire Enterprise" }
  }
  ```

---

## 2. Unified Lead Management

### `GET /api/v1/unified-leads`
Query leads with pagination, stage filtering, and search.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": { "totalLeads": 42, "qualified": 18, "won": 7 },
    "leads": [ ... ]
  }
  ```

### `POST /api/v1/unified-leads`
Ingests a new lead. Returns 409 Conflict if duplicate is detected unless `allowDuplicate: true` is passed.
* **Request**:
  ```json
  {
    "customerName": "Vikram Malhotra",
    "phone": "+91 9876543210",
    "email": "vikram.m@example.com",
    "industry": "LOAN",
    "amount": 5000000,
    "source": "Website"
  }
  ```

### `POST /api/v1/unified-leads/merge`
Merges a redundant source lead into a primary target lead.

---

## 3. Customer 360

### `GET /api/v1/customer360`
Lists all customers with aggregated metric summaries.

### `GET /api/v1/customer360/:id`
Returns deep relational customer graph (Leads, Loans, Properties, Bookings, Tasks, Documents, Communications).

---

## 4. Document Vault & Communications

### `GET /api/v1/documents`
Lists secure documents filtered by category (`KYC`, `CONTRACT`, `FINANCIAL`, `GENERAL`).

### `POST /api/v1/communications/send`
Dispatches a message across WhatsApp, Email, or SMS.
* **Request**:
  ```json
  {
    "channel": "WHATSAPP",
    "recipient": "+919876543210",
    "subject": "Loan Approval Status",
    "body": "Your loan application has been approved."
  }
  ```

---

## 5. Tasks & Unified Calendar

### `GET /api/v1/tasks`
Lists tasks categorized by status (Today, Upcoming, Overdue, Completed).

### `GET /api/v1/calendar/events`
Aggregates calendar events across meetings, site visits, follow-ups, and tasks.

---

## 6. Multi-Domain Analytics & Audit Logs

### `GET /api/v1/analytics/overview`
Aggregated 5-dimensional reporting across leads, sales, real estate, loans, and AI predictions.

### `GET /api/v1/audit-logs`
Returns immutable system event audit records.
