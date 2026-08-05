create table if not exists calendar_appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table calendar_appointments enable row level security;
drop policy if exists calendar_appointments_admin_read on calendar_appointments;
drop policy if exists calendar_appointments_admin_create on calendar_appointments;
drop policy if exists calendar_appointments_admin_update on calendar_appointments;
drop policy if exists calendar_appointments_admin_delete on calendar_appointments;
create policy calendar_appointments_admin_read on calendar_appointments for select using (app_role() in ('super_admin','admin_staff'));
create policy calendar_appointments_admin_create on calendar_appointments for insert with check (app_role() in ('super_admin','admin_staff') and created_by = auth.uid());
create policy calendar_appointments_admin_update on calendar_appointments for update using (app_role() in ('super_admin','admin_staff')) with check (app_role() in ('super_admin','admin_staff'));
create policy calendar_appointments_admin_delete on calendar_appointments for delete using (app_role() in ('super_admin','admin_staff'));
