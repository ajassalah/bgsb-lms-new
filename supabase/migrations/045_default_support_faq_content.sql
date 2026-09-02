insert into support_faqs (question, answer, status)
select seed.question, seed.answer, 'active'
from (values
  ('How do I change my LMS password?', '<p>Open your account menu, select <strong>Change Password</strong>, enter your current password and choose a strong new password. After it is updated, use the new password for your next login.</p>'),
  ('How do I access my enrolled courses?', '<p>Open <strong>My Courses</strong> from the sidebar. Only courses in which you are actively enrolled or assigned will appear.</p>'),
  ('Where can I find course learning materials?', '<p>Open the course and select <strong>Curriculum</strong>. Expand a module to view its video, audio, documents, assignments and quizzes.</p>'),
  ('How do I submit an assignment?', '<p>Go to <strong>My Assignments</strong>, open the relevant course and assignment, then upload the requested file and submit it before the deadline.</p>'),
  ('Can I resubmit an assignment?', '<p>You can resubmit when the assignment review status allows resubmission. Open the assignment details, upload a new attachment and select <strong>Resubmit</strong>.</p>'),
  ('How do I join a scheduled live class?', '<p>Open <strong>Live Classes</strong> or select the event from your dashboard calendar. Use the Join button when the live-class link is available.</p>'),
  ('Where can I download my certificate?', '<p>Open <strong>Certificates</strong> from the student portal. Your issued certificates can be viewed or downloaded from their certificate cards.</p>'),
  ('How do I contact the support team?', '<p>Open <strong>Support → Tickets</strong>, create a new ticket, select its priority, describe the issue and attach any useful screenshots or documents.</p>'),
  ('Where can I see announcements?', '<p>Open <strong>Announcements</strong> from the sidebar or use the notification bell. Published announcements intended for your user role will appear there.</p>'),
  ('What should I do if my session expires?', '<p>For security, inactive sessions expire automatically. Return to the login page and sign in again using your current email address and password.</p>')
) as seed(question, answer)
where not exists (
  select 1 from support_faqs existing where lower(existing.question) = lower(seed.question)
);
