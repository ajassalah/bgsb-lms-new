create table if not exists certificate_templates(
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null unique references courses(id) on delete cascade,
  title text not null,
  certificate_url text not null,
  created_by uuid references profiles(id),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table certificate_templates enable row level security;
create policy certificate_templates_read on certificate_templates for select using(app_role() in('super_admin','admin_staff','instructor') or exists(select 1 from enrollments e where e.course_id=course_id and e.student_id=auth.uid()));
create policy certificate_templates_admin on certificate_templates for all using(app_role()='super_admin') with check(app_role()='super_admin');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('certificate-templates','certificate-templates',true,10485760,array['application/pdf','image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true;
