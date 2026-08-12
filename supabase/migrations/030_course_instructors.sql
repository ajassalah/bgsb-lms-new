create table if not exists course_instructors (
  course_id uuid not null references courses(id) on delete cascade,
  instructor_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references profiles(id) on delete set null,
  primary key (course_id, instructor_id)
);

alter table course_instructors enable row level security;
drop policy if exists course_instructors_read on course_instructors;
drop policy if exists course_instructors_manage on course_instructors;
create policy course_instructors_read on course_instructors for select
  using (app_role() in ('super_admin','admin_staff') or instructor_id = auth.uid());
create policy course_instructors_manage on course_instructors for all
  using (app_role() = 'super_admin') with check (app_role() = 'super_admin');

insert into course_instructors(course_id, instructor_id)
select id, instructor_id from courses where instructor_id is not null
on conflict do nothing;
