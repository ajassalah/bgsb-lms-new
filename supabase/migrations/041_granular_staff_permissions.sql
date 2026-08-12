alter table admin_permissions
add column if not exists actions jsonb not null default '{}'::jsonb;
