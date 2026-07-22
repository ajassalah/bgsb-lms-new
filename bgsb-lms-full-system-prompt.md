# BGSB Learning Management System — Full Build Prompt

**Reference UX pattern:** Faculty LMS (multi-role login screen, public course catalog, instructor directory, blog) — adapted for BGSB as an **enrollment-only** institutional LMS (no public purchase/cart flow; enrollment happens via admin-issued codes or CSV import).

**Stack:** Next.js 14 (App Router) · Supabase (Postgres + Auth + Storage + Realtime) · Tailwind CSS · shadcn/ui · Framer Motion · Deployed self-hosted via Coolify (Docker)

---

## 1. Project Overview

Build a full-stack LMS for **British Graduates School of Business (BGSB)**. The system supports six distinct roles, each with a dedicated dashboard, mirroring the role-switch login pattern of the Faculty demo (`Login As: Admin / Instructor / Admin Staff / Organization / Student / Org Staff`) but without any public checkout — course access is granted only through enrollment codes or CSV bulk-import by staff.

Brand palette: BGSB navy (`#0A2647` or brand navy) and red accent — reuse tokens from the existing BGSB marketing site spec for visual consistency between the public site and the LMS shell.

---

## 2. Roles & Permission Matrix

| Role | Scope | Key Capabilities |
|---|---|---|
| **Super Admin** | Platform-wide | Full control: manage all orgs, staff, instructors, students, courses, schools, system settings, role-permission matrix |
| **Admin Staff** | Platform-wide, scoped by permission | Delegated admin tasks per the permissions matrix (e.g. manage courses but not billing/system settings) |
| **Organization** | Own org only | Manage its Org Staff, view/manage its cohort of enrolled students, view org-level reporting |
| **Org Staff** | Scoped to parent Organization | Enroll/manage students within their organization, no cross-org visibility |
| **Instructor** | Own courses only | Create/manage courses, upload content, schedule live sessions, grade assignments/quizzes, message enrolled students |
| **Student** | Own enrollments only | Browse enrolled courses, attend live sessions, submit assignments, take quizzes, view grades/certificates |

All access enforced via **Supabase Row Level Security (RLS)** — never rely on client-side role checks alone. Every table below must ship with RLS policies scoped to `auth.uid()` and a `role` claim stored in a `profiles` table (never trust a role field editable by the client).

---

## 3. Database Schema (Supabase / Postgres)

```sql
-- ============ IDENTITY ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','admin_staff','organization','org_staff','instructor','student')),
  full_name text not null,
  email text unique not null,
  avatar_url text,
  phone text,
  organization_id uuid references organizations(id),
  status text default 'active' check (status in ('active','suspended','pending')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  contact_phone text,
  logo_url text,
  status text default 'active',
  created_at timestamptz default now()
);

create table admin_permissions (
  id uuid primary key default gen_random_uuid(),
  admin_staff_id uuid references profiles(id) on delete cascade,
  module text not null,            -- e.g. 'courses','users','reports','settings'
  can_view boolean default false,
  can_create boolean default false,
  can_edit boolean default false,
  can_delete boolean default false
);

-- ============ SCHOOL / COURSE HIERARCHY ============
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  name text not null,
  slug text unique not null
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  category_id uuid references categories(id),
  instructor_id uuid references profiles(id),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  level text check (level in ('beginner','intermediate','advanced')),
  duration_weeks int,
  status text default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  position int not null
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references course_modules(id) on delete cascade,
  title text not null,
  content_type text check (content_type in ('video','document','text','link')),
  content_url text,
  position int not null,
  duration_minutes int
);

-- ============ ENROLLMENT (hybrid: codes + CSV, no cart) ============
create table enrollment_codes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  code text unique not null,
  max_uses int default 1,
  used_count int default 0,
  expires_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  course_id uuid references courses(id),
  organization_id uuid references organizations(id),
  enrolled_via text check (enrolled_via in ('code','csv_import','manual')),
  status text default 'active' check (status in ('active','completed','dropped')),
  progress_percent int default 0,
  enrolled_at timestamptz default now(),
  unique(student_id, course_id)
);

-- ============ LIVE SESSIONS ============
create table live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  instructor_id uuid references profiles(id),
  title text not null,
  meeting_url text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled','live','completed','cancelled')),
  created_at timestamptz default now()
);

create table session_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references live_sessions(id) on delete cascade,
  student_id uuid references profiles(id),
  joined_at timestamptz,
  left_at timestamptz
);

-- ============ ASSESSMENTS ============
create table assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  title text not null,
  description text,
  due_date timestamptz,
  max_score int default 100,
  created_at timestamptz default now()
);

create table assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references profiles(id),
  file_url text,
  submitted_at timestamptz default now(),
  score int,
  feedback text,
  graded_by uuid references profiles(id),
  graded_at timestamptz
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  title text not null,
  time_limit_minutes int
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question text not null,
  options jsonb,          -- [{id,text}]
  correct_option text,
  points int default 1
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id),
  student_id uuid references profiles(id),
  answers jsonb,
  score int,
  submitted_at timestamptz default now()
);

-- ============ CERTIFICATES ============
create table certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  course_id uuid references courses(id),
  certificate_url text,
  issued_at timestamptz default now()
);

-- ============ MESSAGING / ANNOUNCEMENTS ============
create table announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  posted_by uuid references profiles(id),
  title text not null,
  body text,
  created_at timestamptz default now()
);
```

> Every table needs RLS enabled (`alter table x enable row level security;`) with policies per role above. Generate these explicitly per table rather than a single blanket policy — Claude Code / Cursor should write one migration file per table group.

---

## 4. Authentication Flow

- Supabase Auth (email + password, magic link optional for staff invites).
- Single `/login` page with a **role selector** identical in spirit to the Faculty demo (`Admin / Instructor / Admin Staff / Organization / Student / Org Staff` tabs) — but the selector only changes the **UI copy/branding**, never grants role client-side. After Supabase auth succeeds, look up `profiles.role` server-side and redirect to the matching dashboard; if the selected tab doesn't match the actual role, show an error rather than logging in.
- No public self-signup for students — "Create an Account" is disabled/removed since enrollment is admin/code driven. Org Staff and Instructor accounts are invited by Super Admin/Admin Staff via email invite (Supabase Auth invite link).
- `/password-forgot` flow via Supabase's built-in reset email.
- Middleware (`middleware.ts`) protects `/dashboard/*` routes, checking session + role before render.

---

## 5. Application Structure

```
/app
  /(public)
    /page.tsx                → BGSB LMS landing (school/course overview, no pricing/cart)
    /courses/page.tsx        → published course catalog (read-only, "Contact to enroll" CTA)
    /courses/[slug]/page.tsx → course detail (curriculum, instructor, no buy button)
    /instructors/page.tsx    → instructor directory
    /login/page.tsx
    /password-forgot/page.tsx
  /dashboard
    /super-admin/...
    /admin-staff/...
    /organization/...
    /org-staff/...
    /instructor/...
    /student/...
  /api
    /enroll/route.ts         → redeem enrollment code
    /import/route.ts         → CSV bulk enrollment (staff only)
    /certificates/route.ts   → generate/issue certificate PDF
/lib/supabase        → client, server, middleware helpers
/lib/permissions      → role/permission guard utilities
/components/ui        → shadcn components
/components/dashboard → role-specific widgets
```

---

## 6. Role Dashboards — Feature Breakdown

### Super Admin
- Org & user management (CRUD across all roles)
- School / category / course hierarchy management
- Admin Staff permission matrix editor
- Platform-wide reporting (enrollments, completions, active sessions)
- System settings (branding, email templates, integrations)

### Admin Staff
- Same modules as Super Admin, gated by `admin_permissions` rows

### Organization
- Manage own Org Staff accounts
- View/manage own students' enrollments
- Org-level completion/attendance reports

### Org Staff
- Enroll students (code redemption or CSV import) within their org
- View own org's student progress

### Instructor
- Course builder (modules → lessons, drag-to-reorder)
- Live session scheduler (creates `live_sessions`, generates meeting link field for Zoom/Meet URL)
- Assignment & quiz builder, grading queue
- Student roster per course, messaging/announcements

### Student
- "My Courses" (enrolled only)
- Course player (lessons, progress tracking via `enrollments.progress_percent`)
- Live session join links + calendar view
- Assignment submission, quiz taking
- Grades & certificate downloads

---

## 7. Enrollment Flow (No Cart)

1. **Code-based:** Admin/Instructor generates `enrollment_codes` for a course → shares code → student/staff redeems via `/api/enroll` → row inserted into `enrollments`, `used_count` incremented, code invalidated at `max_uses`.
2. **CSV import:** Org Staff/Admin uploads CSV (`email, course_slug`) → server validates rows → creates `profiles` (if new) + `enrollments` in a batch, sends invite emails via Supabase Auth admin API.
3. No Stripe/payment integration required anywhere in this build.

---

## 8. Build Phases (suggested order for Claude Code / Cursor)

1. **Foundation** — Next.js 14 scaffold, Tailwind + shadcn setup, BGSB design tokens, Supabase project wiring, env config
2. **Auth & Profiles** — Supabase Auth, `profiles` table + RLS, role-aware middleware, login/role-selector UI
3. **Org & User Management** — Super Admin/Admin Staff CRUD screens for orgs, staff, instructors, students
4. **School/Course Hierarchy** — schools, categories, courses, modules, lessons CRUD (Instructor + Admin)
5. **Enrollment Engine** — enrollment codes generator/redeemer, CSV import pipeline
6. **Live Sessions** — scheduler, calendar view, attendance tracking
7. **Assessments** — assignments + submissions + grading, quiz builder + auto-grading
8. **Certificates** — PDF generation on course completion (trigger when `progress_percent = 100`)
9. **Reporting Dashboards** — role-specific analytics widgets (Recharts)
10. **Polish & Deploy** — responsive QA, Framer Motion micro-interactions, Dockerfile, Coolify deployment config

---

## 9. Deployment

- Dockerfile (multi-stage, Node 20 alpine) for the Next.js app, deployed via Coolify.
- Supabase remains cloud-hosted (per existing BGSB pattern) — only the Next.js app is self-hosted.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, used in `/api/import` and admin invite routes), `NEXT_PUBLIC_SITE_URL`.
- Add a `/api/health` route for Coolify health checks.

---

## 10. Design Notes

- Reuse BGSB navy/red palette and typography tokens from the marketing site for shell consistency (sidebar, top nav, buttons).
- Dashboard shell: fixed sidebar (role-specific nav items), top bar with profile menu + notifications.
- Use shadcn `DataTable` for all admin/staff list views (users, courses, enrollments) with search/filter/pagination built in from the start — these lists will grow large.
- Course player should feel distinct from admin screens — more spacious, video-first layout, progress bar prominent.

---

**Instructions for the AI coding tool (Claude Code / Cursor):** Build phase by phase per Section 8. After each phase, run and verify RLS policies with a test user per role before moving to the next phase. Do not implement any payment/cart UI — all enrollment surfaces must route through the code/CSV flow in Section 7.
