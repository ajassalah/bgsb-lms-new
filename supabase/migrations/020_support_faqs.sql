create table if not exists support_faqs(
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  status text not null default 'active' check(status in('active','inactive')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table support_faqs enable row level security;

drop policy if exists support_faqs_read on support_faqs;
drop policy if exists support_faqs_manage on support_faqs;

create policy support_faqs_read on support_faqs
for select using(status='active' or app_role() in('super_admin','admin_staff'));
create policy support_faqs_manage on support_faqs
for all using(app_role() in('super_admin','admin_staff'))
with check(app_role() in('super_admin','admin_staff'));
