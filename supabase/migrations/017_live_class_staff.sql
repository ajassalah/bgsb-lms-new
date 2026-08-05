create table if not exists live_session_staff(
  session_id uuid not null references live_sessions(id) on delete cascade,
  staff_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(session_id,staff_id)
);

alter table live_session_staff enable row level security;

drop policy if exists live_session_staff_read on live_session_staff;
drop policy if exists live_session_staff_admin on live_session_staff;

create policy live_session_staff_read on live_session_staff
for select using(
  app_role() in('super_admin','admin_staff')
  or staff_id=auth.uid()
);

create policy live_session_staff_admin on live_session_staff
for all using(app_role()='super_admin') with check(app_role()='super_admin');
