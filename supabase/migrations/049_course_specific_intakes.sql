alter table intakes
  add column if not exists course_id uuid references courses(id) on delete restrict;

create index if not exists intakes_course_id_idx on intakes(course_id);
