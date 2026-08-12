alter table support_tickets alter column student_id drop not null;
create table if not exists support_ticket_staff(
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  staff_id uuid not null references profiles(id) on delete cascade,
  primary key(ticket_id,staff_id)
);
create table if not exists user_notifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table support_ticket_staff enable row level security;
alter table user_notifications enable row level security;
create policy support_ticket_staff_read on support_ticket_staff for select using(staff_id=auth.uid() or app_role()='super_admin' or exists(select 1 from support_tickets t where t.id=ticket_id and t.created_by=auth.uid()));
create policy notifications_owner on user_notifications for select using(user_id=auth.uid());
create policy notifications_owner_update on user_notifications for update using(user_id=auth.uid()) with check(user_id=auth.uid());
