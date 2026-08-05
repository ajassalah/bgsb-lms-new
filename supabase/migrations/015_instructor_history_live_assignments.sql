alter table profiles add column if not exists education_background jsonb not null default '[]'::jsonb;
alter table profiles add column if not exists professional_details jsonb not null default '[]'::jsonb;
alter table profiles add column if not exists resume_url text;
create table if not exists live_session_instructors(
  session_id uuid not null references live_sessions(id) on delete cascade,
  instructor_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(session_id,instructor_id)
);
alter table live_session_instructors enable row level security;
drop policy if exists live_session_instructors_read on live_session_instructors;
drop policy if exists live_session_instructors_admin on live_session_instructors;
create policy live_session_instructors_read on live_session_instructors for select using(app_role() in('super_admin','admin_staff') or instructor_id=auth.uid());
create policy live_session_instructors_admin on live_session_instructors for all using(app_role()='super_admin') with check(app_role()='super_admin');
