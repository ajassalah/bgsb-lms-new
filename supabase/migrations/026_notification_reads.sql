create table if not exists notification_reads (
  user_id uuid not null references profiles(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz not null default now(),
  primary key(user_id,notification_id)
);
alter table notification_reads enable row level security;
drop policy if exists notification_reads_own on notification_reads;
create policy notification_reads_own on notification_reads for all using(user_id=auth.uid()) with check(user_id=auth.uid());
