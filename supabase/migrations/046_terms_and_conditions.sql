create table if not exists legal_terms (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  title text not null default 'BGSB LMS Terms & Conditions',
  content text not null,
  effective_date date not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  terms_id uuid not null references legal_terms(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(user_id, terms_version)
);

create index if not exists terms_acceptances_user_version_idx
  on terms_acceptances(user_id, terms_version);

alter table legal_terms enable row level security;
alter table terms_acceptances enable row level security;

drop policy if exists legal_terms_published_read on legal_terms;
create policy legal_terms_published_read on legal_terms
for select using(is_published or app_role() in ('super_admin','admin_staff'));

drop policy if exists legal_terms_admin_manage on legal_terms;
create policy legal_terms_admin_manage on legal_terms
for all using(app_role() in ('super_admin','admin_staff'))
with check(app_role() in ('super_admin','admin_staff'));

drop policy if exists terms_acceptances_owner_read on terms_acceptances;
create policy terms_acceptances_owner_read on terms_acceptances
for select using(user_id = auth.uid() or app_role() in ('super_admin','admin_staff'));

drop policy if exists terms_acceptances_owner_create on terms_acceptances;
create policy terms_acceptances_owner_create on terms_acceptances
for insert with check(user_id = auth.uid());

insert into legal_terms(version,title,content,effective_date,is_published,published_at)
select '1.0','BGSB LMS Terms & Conditions',
'<h2>1. Introduction</h2><p>Welcome to the British Graduates School of Business Learning Management System (BGSB LMS). These Terms & Conditions govern access to and use of the LMS, its courses, learning materials, assessments, communications and related services.</p>
<h2>2. Acceptance of Terms</h2><p>By accepting these Terms, you confirm that you have read, understood and agreed to comply with them. If you do not agree, you may not access the protected areas of the LMS.</p>
<h2>3. User Accounts and Security</h2><p>Your account is personal to you. You must provide accurate information, protect your login credentials, change temporary passwords promptly and notify BGSB immediately if you suspect unauthorized access. You must not share, transfer or misuse another user''s account.</p>
<h2>4. Acceptable Use</h2><p>You must use the LMS only for authorized educational and administrative purposes. You must not disrupt services, bypass security, upload malicious or unlawful material, harass other users, impersonate another person, scrape content, or attempt unauthorized access.</p>
<h2>5. Courses, Assessments and Academic Integrity</h2><p>Course access, deadlines, attendance requirements, assessment rules and grading are governed by the applicable programme and BGSB academic policies. Submitted work must be your own unless collaboration is expressly permitted. Plagiarism, cheating and falsification may result in academic or disciplinary action.</p>
<h2>6. Learning Materials and Intellectual Property</h2><p>LMS content, branding, recordings, documents and resources are owned by or licensed to BGSB. Access is granted for personal learning or authorized work only. Content may not be copied, published, sold, recorded, distributed or commercially reused without written permission.</p>
<h2>7. Communications and User Content</h2><p>You are responsible for messages, files and other content you submit. Content must be lawful, respectful and relevant. BGSB may moderate or remove content that violates these Terms or applicable policy.</p>
<h2>8. Privacy and Monitoring</h2><p>BGSB processes account, academic, activity, device and support information to operate, secure and improve the LMS. Activity may be logged for security, auditing and academic administration. Personal information is handled according to applicable privacy requirements and the BGSB privacy policy.</p>
<h2>9. Availability and Third-Party Services</h2><p>BGSB aims to provide reliable access but does not guarantee uninterrupted availability. Maintenance, connectivity problems and third-party services may affect access. External meeting, payment or content services may also be governed by their own terms.</p>
<h2>10. Suspension and Termination</h2><p>BGSB may restrict, suspend or terminate access where required for security, legal compliance, non-payment, completion of studies, breach of policy or misuse of the LMS.</p>
<h2>11. Changes to These Terms</h2><p>BGSB may publish a new version of these Terms. When a new version takes effect, users may be required to review and accept it before continuing to use the LMS.</p>
<h2>12. Support and Contact</h2><p>Questions about these Terms or LMS access should be submitted through the Help & Support area or sent to info@bgsb.lk.</p>',
current_date,true,now()
where not exists(select 1 from legal_terms where version='1.0');
