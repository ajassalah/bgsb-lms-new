alter table enrollments
  add column if not exists batch_id uuid references batches(id) on delete set null;

create index if not exists enrollments_batch_id_idx on enrollments(batch_id);

insert into batch_learners(batch_id, student_id)
select batch_id, student_id from enrollments where batch_id is not null
on conflict (batch_id, student_id) do nothing;
