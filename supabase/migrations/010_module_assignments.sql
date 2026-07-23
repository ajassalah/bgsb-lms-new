alter table assignments add column if not exists module_id uuid references course_modules(id) on delete cascade;
alter table assignments add column if not exists instructor_id uuid references profiles(id);
alter table assignments add column if not exists pass_marks int default 40;
alter table assignments add column if not exists file_url text;
