# Architecture & Design Decisions — Coffee Ninja (InquiryFlow)

## Assumptions
1. **Single-tenant tech service & repair support portal**: One Coffee Ninja organization manages all customers, technicians/employees, and administrators within a shared PostgreSQL database.
2. **Self-service customer registration; staff accounts provisioned via DB/seed**: Public `POST /api/v1/register` creates `CUSTOMER` accounts only. `EMPLOYEE` and `ADMIN` accounts are created directly in the database so role escalation cannot happen through public signup.
3. **Soft deactivation over hard deletion for employees**: Employee accounts are deactivated/reactivated via `users.isActive` (`PATCH /api/v1/employees/:id/status`) rather than deleted, preserving historical inquiry assignments, status history, and workload reports while immediately blocking login and active sessions (`verifyUser`).
4. **In-app notifications over email**: Real-time alerts are delivered through Socket.IO rooms (`customer:<id>`, `employee:<id>`) and persisted in PostgreSQL rather than external SMTP/email providers.
5. **Allowed attachment formats**: Reply attachments are restricted to PDF, PNG, and JPG (up to 5 MiB) and verified by file magic bytes (`file-type`) before uploading to Cloudinary.

---

## Key Design Choices

### 1. Optimistic Concurrency Control (`version` column) for Stale-Data Safety
- **Choice**: Inquiries carry a `version` integer column. State-changing endpoints (`PATCH /inquiry/:id/assignment`, `PATCH /inquiry/assigned/:id/status`, `PATCH /inquiry/:id/reopen`, `PATCH /inquiry/:id/close`) require the client's last-seen `version` and perform an atomic `WHERE id = $1 AND version = $2` update that increments `version`. If zero rows match, the server returns `409 Conflict`.
- **Why**: If two browser tabs (or two staff members) open the same inquiry and one updates its status or assignment, the second tab cannot silently overwrite newer state. The UI catches `409` and prompts the user to refresh the latest inquiry state.

### 2. Server-Enforced Role & Ownership Authorization on Every Endpoint
- **Choice**: Authentication uses `HttpOnly` JWT cookies (`verifyUser`), followed by `rolebasedAccess(...)` middleware and service-level ownership checks (`customerId = req.user.id` for customers, `assignedEmployeeId = req.user.id` for employees). Attachment downloads (`GET /api/v1/message/attachments/:attachmentId/download`) also stream through an authenticated backend endpoint that verifies inquiry ownership before generating a short-lived Cloudinary signed download URL.
- **Why**: Direct URL navigation or raw API calls (bypassing React Router guards) cannot read or mutate another customer's inquiry, another employee's assigned ticket, internal staff notes (`visibility: INTERNAL`), or private attachments.

### 3. RTK Query Tag Invalidation + Targeted Socket.IO Events
- **Choice**: Frontend state uses Redux Toolkit Query with entity/list tags (`Inquiry`, `Reply`, `InternalNote`, `Notification`, `Report`), paired with Socket.IO events (`notifications:changed`, `customer-reply:created`, `employee-reply:created`) that invalidate relevant tags in `AppLayout`.
- **Why**: Mutations automatically refresh affected lists, counters, and detail views without manual state merging, while Socket.IO pushes live updates across active customer/employee sessions without polling.

---

## Accepted Trade-Off
- **Stale tab refreshes on user action rather than live-pushing every inquiry field**: When two tabs display the same inquiry and one tab updates it, the second tab intentionally keeps its snapshot until the user triggers an action (receiving a `409 Conflict` with a clear prompt) or reloads. Broadcasting full inquiry-row diffs over WebSockets to every open tab would add room-subscription complexity and race conditions with in-flight forms; optimistic concurrency (`version`) guarantees correctness with much simpler server state.

---

## What I Would Improve Next

1. **End-to-end integration tests with a test database**: Add automated route/service tests against an ephemeral PostgreSQL instance (covering login cookies, `409` version conflicts, and `403/401` cross-user access) plus browser E2E tests (Playwright) for the full customer → admin → employee → customer flow.
2. **Email/webhook notifications & password reset**: Add transactional email alerts for offline users and a token-based password reset flow.

