alter table lessons drop constraint if exists lessons_content_type_check;
alter table lessons add constraint lessons_content_type_check check(content_type in('video','audio','document','text','link'));
alter table quizzes add column if not exists module_id uuid references course_modules(id) on delete cascade;
