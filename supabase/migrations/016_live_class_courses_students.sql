create table if not exists live_session_courses(
  session_id uuid not null references live_sessions(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(session_id,course_id)
);

create table if not exists live_session_students(
  session_id uuid not null references live_sessions(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(session_id,student_id)
);

alter table live_session_courses enable row level security;
alter table live_session_students enable row level security;

drop policy if exists live_session_courses_read on live_session_courses;
drop policy if exists live_session_courses_admin on live_session_courses;
drop policy if exists live_session_students_read on live_session_students;
drop policy if exists live_session_students_admin on live_session_students;

create policy live_session_courses_read on live_session_courses
for select using(app_role() in('super_admin','admin_staff') or exists(
  select 1 from live_session_instructors i
  where i.session_id=live_session_courses.session_id and i.instructor_id=auth.uid()
));
create policy live_session_courses_admin on live_session_courses
for all using(app_role()='super_admin') with check(app_role()='super_admin');

create policy live_session_students_read on live_session_students
for select using(app_role() in('super_admin','admin_staff') or student_id=auth.uid() or exists(
  select 1 from live_session_instructors i
  where i.session_id=live_session_students.session_id and i.instructor_id=auth.uid()
));
create policy live_session_students_admin on live_session_students
for all using(app_role()='super_admin') with check(app_role()='super_admin');
