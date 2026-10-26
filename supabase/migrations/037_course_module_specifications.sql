alter table course_modules
  add content_kind text not null default 'module'
  check (content_kind in ('module', 'specification'));
