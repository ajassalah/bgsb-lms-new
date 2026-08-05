create table if not exists email_templates(id uuid primary key default gen_random_uuid(),subject text not null,body text not null,attachment_url text,attachment_name text,created_by uuid references profiles(id),created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists email_configuration(id integer primary key default 1 check(id=1),smtp_host text,smtp_port integer default 587,smtp_username text,smtp_password text,from_name text,from_email text,encryption text default 'tls' check(encryption in('none','ssl','tls')),updated_at timestamptz default now());
alter table email_templates enable row level security;alter table email_configuration enable row level security;
drop policy if exists email_templates_admin on email_templates;drop policy if exists email_configuration_admin on email_configuration;
create policy email_templates_admin on email_templates for all using(app_role() in('super_admin','admin_staff')) with check(app_role() in('super_admin','admin_staff'));
create policy email_configuration_admin on email_configuration for all using(app_role()='super_admin') with check(app_role()='super_admin');
