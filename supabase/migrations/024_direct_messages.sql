create table if not exists message_favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  favorite_user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, favorite_user_id),
  check (user_id <> favorite_user_id)
);

create table if not exists direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  body text,
  attachment_url text,
  attachment_name text,
  attachment_type text check (attachment_type in ('image','video','audio','file')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id),
  check (nullif(trim(body),'') is not null or attachment_url is not null)
);

create index if not exists direct_messages_conversation_idx on direct_messages(sender_id, recipient_id, created_at);
alter table message_favorites enable row level security;
alter table direct_messages enable row level security;
drop policy if exists message_favorites_own on message_favorites;
drop policy if exists direct_messages_participants on direct_messages;
drop policy if exists direct_messages_send on direct_messages;
create policy message_favorites_own on message_favorites for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy direct_messages_participants on direct_messages for select using (sender_id=auth.uid() or recipient_id=auth.uid());
create policy direct_messages_send on direct_messages for insert with check (sender_id=auth.uid());
