alter table private_files add column if not exists updated_at timestamptz not null default now();
update private_files set updated_at=created_at;
