create table if not exists student_payments(
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  payment_method text not null,
  amount numeric(12,2) not null default 0,
  paid_at timestamptz not null default now()
);
create table if not exists student_login_history(
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  browser text,
  platform text,
  ip_address text,
  logged_at timestamptz not null default now()
);
alter table student_payments enable row level security;
alter table student_login_history enable row level security;
create policy student_payments_read on student_payments for select using(student_id=auth.uid() or app_role()='super_admin');
create policy student_payments_admin on student_payments for all using(app_role()='super_admin') with check(app_role()='super_admin');
create policy student_login_read on student_login_history for select using(student_id=auth.uid() or app_role()='super_admin');
create policy student_login_admin on student_login_history for all using(app_role()='super_admin') with check(app_role()='super_admin');
