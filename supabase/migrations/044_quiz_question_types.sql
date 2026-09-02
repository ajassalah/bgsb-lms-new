alter table quiz_questions add column if not exists question_type text not null default 'single_radio';
alter table quiz_questions drop constraint if exists quiz_questions_question_type_check;
alter table quiz_questions add constraint quiz_questions_question_type_check
  check (question_type in ('single_radio','single_dropdown'));
