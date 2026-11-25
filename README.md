# Coffee Ninja — InquiryFlow

A full-stack, role-based customer inquiry and support management system built with React, TypeScript, Redux Toolkit Query, Express, PostgreSQL, Drizzle ORM, Socket.IO, and Cloudinary.

---

## Features

### Role-Based Workspaces
- **Customer (`/customer`)**
  - Submit support inquiries (`POST /api/v1/inquiry`) with topic templates and validation.
  - Browse paginated, searchable, status-filtered personal inquiries (`/inquiries`).
  - View inquiry threads, send nested public replies, upload attachments (PDF, PNG, JPG up to 5 MiB), and download attachments.
  - Receive real-time in-app notifications via Socket.IO (`/notifications`).

- **Employee (`/employee`)**
  - View assigned inquiries (`/employee/inquiries`) with server-side search, status/priority filtering, and pagination.
  - Update inquiry statuses (`ASSIGNED` → `IN_PROGRESS` → `WAITING_FOR_CUSTOMER` → `RESOLVED`) with optimistic concurrency (`version` conflict checks).
  - Reply publicly with attachments and record staff-only internal notes (`visibility: INTERNAL`).
  - Receive real-time notifications on assignments and customer replies (`/employee/notifications`).

- **Admin (`/admin`)**
  - View real-time inquiry status summaries (all 6 statuses) and employee workload reports (including inactive employees who still own open work).
  - Manage the inquiry queue (`/admin/inquiries`), assign or reassign inquiries to active employees, set priority (`LOW`, `NORMAL`, `URGENT`), and reopen or close resolved inquiries.

### Responsive UI
- Dark-green design system built with Tailwind CSS v4.
- **Desktop**: Static sidebar navigation and top header with independent inner-page scrolling.
- **Mobile**: Compact sticky top bar with time-based greeting and unread notification badge, fixed bottom navigation bar, and an accessible **More** bottom sheet.

---

## Tech Stack

- **Frontend (`frontend/coffe_ninja_inquiries`)**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Redux Toolkit Query, Socket.IO Client, `react-icons`
- **Backend (`backend`)**: Node.js (ES Modules), Express 5, PostgreSQL, Drizzle ORM, Zod, JWT (`cookie-parser`), `bcrypt` / `bcryptjs`, Multer + `file-type`, Cloudinary, Socket.IO

---

## Project Structure

```text
coffe-ninja-inquiries/
├── backend/
│   ├── config/
│   │   ├── db/schema/         # Drizzle PostgreSQL schemas
│   │   ├── cloudinary.mjs     # Cloudinary configuration
│   │   ├── env.mjs            # Zod-validated environment config
│   │   └── notificationSocket.mjs
│   ├── controllers/           # Auth, inquiry, message, notification, report controllers
│   ├── middlewares/           # JWT auth, role guard, rate limiting, Multer upload, error handler
│   ├── routes/                # Express v1 API routes
│   ├── services/              # Business logic & Cloudinary upload/download services
│   ├── utils/                 # AppError, APIHelper (search/filter/pagination), JWT & password helpers
│   ├── app.mjs
│   └── server.mjs
└── frontend/
    └── coffe_ninja_inquiries/
        └── src/
            ├── app/           # Redux store & RTK Query baseApi
            ├── components/    # Layout, RoleGuard, ReplyThread, PublicReplyForm, NotificationInbox, reports, UI primitives
            ├── config/        # Centralized role navigation & page titles
            ├── features/      # RTK Query endpoints (auth, inquiries, messages, notifications, reports)
            ├── hooks/         # Shared hooks (e.g., useIsMobile)
            └── pages/         # Role-organized pages (admin, auth, customer, employee, notifications)
```

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database
- Cloudinary account (for authenticated reply attachments)

### 2. Backend Environment Variables
Create `backend/config/config.env` with:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_at_least_32_character_random_secret_key
NODE_ENV=development
ACCESS_TOKEN_TTL_SECONDS=3600
FRONTEND_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run the Backend
```bash
cd backend
npm install
npm start
```
The Express + Socket.IO server runs on `http://localhost:8000` by default (`process.env.PORT || 8000`).

### 4. Run the Frontend
```bash
cd frontend/coffe_ninja_inquiries
npm install
npm run dev
```
Vite runs on `http://localhost:5173` and proxies `/api` and `/socket.io` to `http://localhost:8000`.

---

## Available Frontend Scripts

Run inside `frontend/coffe_ninja_inquiries`:

- `npm run dev` — Start the Vite development server
- `npm run build` — Run TypeScript project build (`tsc -b`) and Vite production bundle
- `npm run lint` — Run ESLint across the frontend
- `npm run preview` — Preview the production build locally

---

## API Overview (`/api/v1`)

- **Auth**: `POST /register`, `POST /login`, `POST /logout`, `GET /profile`, `GET /get-all-customers`
- **Inquiries**:
  - Customer: `POST /inquiry`, `GET /inquiry/my`, `GET /inquiry/:id`
  - Employee: `GET /inquiry/assigned`, `GET /inquiry/assigned/:id`, `PATCH /inquiry/assigned/:id/status`
  - Admin: `GET /inquiry/admin`, `GET /inquiry/get-employee`, `PATCH /inquiry/:id/assignment`, `PATCH /inquiry/:id/reopen`, `PATCH /inquiry/:id/close`
- **Messages & Attachments**:
  - `GET/POST /message/:id/replies` (Customer)
  - `GET/POST /message/assigned/:id/replies` (Employee)
  - `GET/POST /message/assigned/:id/notes` (Employee internal notes)
  - `GET /message/attachments/:attachmentId/download` (Authenticated customer/employee download)
- **Notifications**: `GET /notifications`, `PATCH /notifications/:id/read`
- **Reports (Admin)**: `GET /reports/employee-workload`, `GET /reports/inquiry-status`