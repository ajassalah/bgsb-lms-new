alter table profiles add column if not exists verification_status text not null default 'pending' check(verification_status in('pending','verified','declined'));
alter table profiles add column if not exists verified_as text check(verified_as in('admin','super_admin','manager'));
alter table profiles add column if not exists verified_by uuid references profiles(id) on delete set null;
alter table profiles add column if not exists verified_at timestamptz;
