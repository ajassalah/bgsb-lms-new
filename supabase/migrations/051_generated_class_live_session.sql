alter table generated_classes
  add column if not exists scheduled_at timestamptz,
  add column if not exists live_session_id uuid references live_sessions(id) on delete set null;

create index if not exists generated_classes_live_session_idx
  on generated_classes(live_session_id);

create index if not exists session_attendance_student_session_idx
  on session_attendance(student_id, session_id, joined_at);
