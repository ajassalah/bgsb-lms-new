create table if not exists support_tickets(
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  subject text not null,
  priority text not null default 'medium' check(priority in('low','medium','high')),
  status text not null default 'open' check(status in('open','pending','answered','on_hold','closed')),
  description text not null,
  attachment_url text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists support_ticket_replies(
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  message text not null,
  replied_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table support_tickets enable row level security;
alter table support_ticket_replies enable row level security;

drop policy if exists support_tickets_read on support_tickets;
drop policy if exists support_tickets_manage on support_tickets;
drop policy if exists support_replies_read on support_ticket_replies;
drop policy if exists support_replies_manage on support_ticket_replies;

create policy support_tickets_read on support_tickets
for select using(
  app_role() in('super_admin','admin_staff')
  or student_id=auth.uid()
);
create policy support_tickets_manage on support_tickets
for all using(app_role() in('super_admin','admin_staff'))
with check(app_role() in('super_admin','admin_staff'));

create policy support_replies_read on support_ticket_replies
for select using(
  app_role() in('super_admin','admin_staff')
  or exists(
    select 1 from support_tickets ticket
    where ticket.id=ticket_id and ticket.student_id=auth.uid()
  )
);
create policy support_replies_manage on support_ticket_replies
for all using(app_role() in('super_admin','admin_staff'))
with check(app_role() in('super_admin','admin_staff'));
