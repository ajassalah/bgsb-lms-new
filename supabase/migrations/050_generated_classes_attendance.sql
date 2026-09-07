create table if not exists generated_classes (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generated_class_courses (
  class_id uuid not null references generated_classes(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  primary key (class_id, course_id)
);

create table if not exists generated_class_batches (
  class_id uuid not null references generated_classes(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  primary key (class_id, batch_id)
);

create table if not exists generated_class_instructors (
  class_id uuid not null references generated_classes(id) on delete cascade,
  instructor_id uuid not null references profiles(id) on delete cascade,
  primary key (class_id, instructor_id)
);

create table if not exists generated_class_staff (
  class_id uuid not null references generated_classes(id) on delete cascade,
  staff_id uuid not null references profiles(id) on delete cascade,
  primary key (class_id, staff_id)
);

create table if not exists class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references generated_classes(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present','absent','late')),
  login_at timestamptz,
  logout_at timestamptz,
  recorded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, batch_id, student_id, attendance_date)
);

alter table generated_classes enable row level security;
alter table generated_class_courses enable row level security;
alter table generated_class_batches enable row level security;
alter table generated_class_instructors enable row level security;
alter table generated_class_staff enable row level security;
alter table class_attendance enable row level security;

create policy generated_classes_admin on generated_classes for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy generated_class_courses_admin on generated_class_courses for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy generated_class_batches_admin on generated_class_batches for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy generated_class_instructors_admin on generated_class_instructors for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy generated_class_staff_admin on generated_class_staff for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy class_attendance_admin on class_attendance for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));

create index if not exists class_attendance_lookup_idx on class_attendance(class_id,batch_id,attendance_date);
