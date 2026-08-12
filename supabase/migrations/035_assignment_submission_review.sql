alter table assignment_submissions add column if not exists description text;
alter table assignment_submissions add column if not exists review_status text not null default 'submitted';
alter table assignment_submissions drop constraint if exists assignment_submissions_review_status_check;
alter table assignment_submissions add constraint assignment_submissions_review_status_check check(review_status in('submitted','accepted','declined','resubmit'));
