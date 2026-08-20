alter table assignment_submissions add column if not exists grade text;
alter table assignment_submissions drop constraint if exists assignment_submissions_grade_check;
alter table assignment_submissions add constraint assignment_submissions_grade_check check (grade is null or grade in ('distinction','pass','credit_pass','fail'));

create table if not exists assignment_submission_attempts (
  id uuid primary key default gen_random_uuid(), assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade, file_url text not null, description text,
  submitted_at timestamptz not null default now(), attempt_number integer not null check (attempt_number > 0),
  unique (assignment_id, student_id, attempt_number)
);
create index if not exists assignment_submission_attempts_lookup_idx on assignment_submission_attempts(assignment_id, student_id, attempt_number);
alter table assignment_submission_attempts enable row level security;
drop policy if exists assignment_attempts_read on assignment_submission_attempts;
create policy assignment_attempts_read on assignment_submission_attempts for select using (student_id = auth.uid() or app_role() in ('super_admin','admin_staff') or exists (select 1 from assignments a join course_instructors ci on ci.course_id = a.course_id where a.id = assignment_id and ci.instructor_id = auth.uid()));
drop policy if exists assignment_attempts_create on assignment_submission_attempts;
create policy assignment_attempts_create on assignment_submission_attempts for insert with check (student_id = auth.uid() or app_role() in ('super_admin','admin_staff'));
insert into assignment_submission_attempts (assignment_id,student_id,file_url,description,submitted_at,attempt_number)
select assignment_id,student_id,file_url,description,submitted_at,1 from assignment_submissions s where file_url is not null
and not exists (select 1 from assignment_submission_attempts a where a.assignment_id=s.assignment_id and a.student_id=s.student_id);

create table if not exists certificate_verifications (
  course_id uuid not null references courses(id) on delete cascade, student_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'certificate_claimed' check (status in ('certificate_claimed','certificate_issued','waiting_for_hardcopy','done')),
  updated_by uuid references profiles(id) on delete set null, updated_at timestamptz not null default now(), primary key(course_id,student_id)
);
alter table certificate_verifications enable row level security;
drop policy if exists certificate_verifications_read on certificate_verifications;
create policy certificate_verifications_read on certificate_verifications for select using (student_id=auth.uid() or app_role() in ('super_admin','admin_staff'));
drop policy if exists certificate_verifications_manage on certificate_verifications;
create policy certificate_verifications_manage on certificate_verifications for all using (app_role() in ('super_admin','admin_staff')) with check (app_role() in ('super_admin','admin_staff'));
