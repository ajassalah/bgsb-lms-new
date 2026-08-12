alter table profiles drop constraint if exists profiles_verification_status_check;

update profiles
set verification_status = 'pending'
where verification_status is null
   or verification_status not in ('pending', 'verified', 'declined');

alter table profiles alter column verification_status set default 'pending';
alter table profiles add constraint profiles_verification_status_check
  check (verification_status in ('pending', 'verified', 'declined'));
