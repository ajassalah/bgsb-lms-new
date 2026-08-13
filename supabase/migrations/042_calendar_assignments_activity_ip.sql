create table if not exists calendar_appointment_users (
  appointment_id uuid not null references calendar_appointments(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  assigned_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (appointment_id,user_id)
);
alter table calendar_appointment_users enable row level security;
drop policy if exists calendar_appointment_users_read on calendar_appointment_users;
drop policy if exists calendar_appointment_users_manage on calendar_appointment_users;
create policy calendar_appointment_users_read on calendar_appointment_users for select using(user_id=auth.uid() or app_role() in('super_admin','admin_staff'));
create policy calendar_appointment_users_manage on calendar_appointment_users for all using(app_role() in('super_admin','admin_staff')) with check(app_role() in('super_admin','admin_staff'));
alter table admin_activity_logs add column if not exists ip_address text;
alter table admin_activity_logs add column if not exists user_agent text;
