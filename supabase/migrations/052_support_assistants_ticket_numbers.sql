alter table support_tickets
add column if not exists ticket_no text;

create unique index if not exists support_tickets_ticket_no_key
on support_tickets(ticket_no)
where ticket_no is not null;

create table if not exists support_assistant_roles(
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists support_assistants(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role_id uuid not null references support_assistant_roles(id) on delete restrict,
  designation text not null default '',
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table support_assistants
alter column designation set default '';

alter table support_assistant_roles enable row level security;
alter table support_assistants enable row level security;

drop policy if exists support_assistant_roles_read on support_assistant_roles;
drop policy if exists support_assistant_roles_manage on support_assistant_roles;
drop policy if exists support_assistants_read on support_assistants;
drop policy if exists support_assistants_manage on support_assistants;

create policy support_assistant_roles_read
on support_assistant_roles for select
using(auth.role()='authenticated');

create policy support_assistant_roles_manage
on support_assistant_roles for all
using(app_role() in('super_admin','admin_staff'))
with check(app_role() in('super_admin','admin_staff'));

create policy support_assistants_read
on support_assistants for select
using(auth.role()='authenticated');

create policy support_assistants_manage
on support_assistants for all
using(app_role() in('super_admin','admin_staff'))
with check(app_role() in('super_admin','admin_staff'));

with numbered as (
  select
    id,
    'BGSB-' || to_char(created_at at time zone 'Asia/Colombo', 'YYYYMMDD') || '-' ||
    lpad(row_number() over (
      partition by to_char(created_at at time zone 'Asia/Colombo', 'YYYYMMDD')
      order by created_at, id
    )::text, 3, '0') as generated_ticket_no
  from support_tickets
  where ticket_no is null
)
update support_tickets
set ticket_no = numbered.generated_ticket_no
from numbered
where support_tickets.id = numbered.id;

create or replace function set_support_ticket_no()
returns trigger
language plpgsql
as $$
declare
  day_key text;
  next_number int;
begin
  if new.ticket_no is not null then
    return new;
  end if;

  day_key := to_char(new.created_at at time zone 'Asia/Colombo', 'YYYYMMDD');
  perform pg_advisory_xact_lock(hashtext('support_ticket_no:' || day_key));

  select coalesce(max((substring(ticket_no from '-([0-9]+)$'))::int), 0) + 1
  into next_number
  from support_tickets
  where ticket_no like 'BGSB-' || day_key || '-%';

  new.ticket_no := 'BGSB-' || day_key || '-' || lpad(next_number::text, 3, '0');
  return new;
end;
$$;

drop trigger if exists support_ticket_no_before_insert on support_tickets;
create trigger support_ticket_no_before_insert
before insert on support_tickets
for each row execute function set_support_ticket_no();
