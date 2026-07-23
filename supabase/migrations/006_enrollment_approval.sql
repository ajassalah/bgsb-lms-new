alter table enrollments drop constraint if exists enrollments_status_check;
update enrollments set status='approved' where status='active';
alter table enrollments alter column status set default 'pending';
alter table enrollments add constraint enrollments_status_check check(status in('pending','approved','declined','completed','dropped'));
