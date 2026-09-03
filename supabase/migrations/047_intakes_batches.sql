create sequence if not exists intake_ref_sequence start with 2442;
create sequence if not exists batch_ref_sequence start with 4440;

create table if not exists intakes (
  id uuid primary key default gen_random_uuid(),
  ref_no text not null unique default ('REG-' || nextval('intake_ref_sequence')),
  name text not null,
  description text,
  type text not null check(type in ('regular','late','early')),
  year int not null check(year between 2000 and 2200),
  status text not null default 'draft' check(status in ('active','inactive','draft')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  ref_no text not null unique default ('BH-' || nextval('batch_ref_sequence')),
  course_id uuid not null references courses(id) on delete cascade,
  intake_id uuid not null references intakes(id) on delete restrict,
  batch_name text not null,
  start_date date not null,
  duration_value int not null check(duration_value > 0),
  duration_unit text not null check(duration_unit in ('days','weeks','months','years')),
  end_date date not null,
  status text not null default 'draft' check(status in ('active','inactive','draft')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists batch_learners (
  batch_id uuid not null references batches(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(batch_id, student_id)
);

alter table intakes enable row level security;
alter table batches enable row level security;
alter table batch_learners enable row level security;

create policy intakes_read on intakes for select using(auth.uid() is not null);
create policy intakes_manage on intakes for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy batches_read on batches for select using(auth.uid() is not null);
create policy batches_manage on batches for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
create policy batch_learners_read on batch_learners for select using(auth.uid()=student_id or app_role() in ('super_admin','admin_staff','instructor'));
create policy batch_learners_manage on batch_learners for all using(app_role() in ('super_admin','admin_staff')) with check(app_role() in ('super_admin','admin_staff'));
