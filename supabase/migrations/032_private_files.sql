create table if not exists private_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references private_files(id) on delete cascade,
  name text not null,
  item_type text not null check (item_type in ('file','folder')),
  storage_path text,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  created_at timestamptz not null default now()
);
create index if not exists private_files_user_parent_idx on private_files(user_id,parent_id);
alter table private_files enable row level security;
drop policy if exists private_files_owner on private_files;
create policy private_files_owner on private_files for all using(user_id=auth.uid()) with check(user_id=auth.uid());
