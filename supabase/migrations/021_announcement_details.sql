alter table announcements add column if not exists receiver_types text[] not null default '{}';
alter table announcements add column if not exists attachment_url text;
alter table announcements add column if not exists updated_at timestamptz not null default now();
