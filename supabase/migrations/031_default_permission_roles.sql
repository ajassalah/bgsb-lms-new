insert into staff_roles(name, permissions) values
  ('Admin', '{}'::jsonb),
  ('Manager', '{}'::jsonb),
  ('Academic Coordinator', '{}'::jsonb),
  ('Instructor', '{}'::jsonb),
  ('Student', '{}'::jsonb)
on conflict (name) do nothing;

update staff_roles
set permissions = (
  select jsonb_object_agg(module, jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true))
  from unnest(array['Dashboard','Enrollment','Courses','Categories','Certificates','Live Classes','Assignments','Students','Instructors','Staff','Announcements','Messages','Calendar','Tickets','FAQ','Reports','System Settings']) module
)
where name = 'Admin' and permissions = '{}'::jsonb;

update staff_roles
set permissions = (
  select jsonb_object_agg(module, jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', false))
  from unnest(array['Dashboard','Enrollment','Courses','Categories','Certificates','Live Classes','Assignments','Students','Instructors','Staff','Announcements','Messages','Calendar','Tickets','FAQ','Reports']) module
)
where name = 'Manager' and permissions = '{}'::jsonb;

update staff_roles
set permissions = (
  select jsonb_object_agg(module, jsonb_build_object('view', true, 'create', module in ('Courses','Live Classes','Assignments','Announcements'), 'edit', module in ('Courses','Live Classes','Assignments','Announcements'), 'delete', false))
  from unnest(array['Dashboard','Enrollment','Courses','Categories','Certificates','Live Classes','Assignments','Students','Instructors','Announcements','Messages','Calendar','Tickets','FAQ','Reports']) module
)
where name = 'Academic Coordinator' and permissions = '{}'::jsonb;
