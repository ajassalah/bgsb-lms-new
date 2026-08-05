alter table announcements add column if not exists scheduled_at timestamptz;
alter table profiles add column if not exists staff_role text default 'Staff';

create table if not exists staff_roles(
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table staff_roles enable row level security;
drop policy if exists staff_roles_read on staff_roles;
drop policy if exists staff_roles_manage on staff_roles;
create policy staff_roles_read on staff_roles for select using(app_role() in('super_admin','admin_staff'));
create policy staff_roles_manage on staff_roles for all using(app_role()='super_admin') with check(app_role()='super_admin');
