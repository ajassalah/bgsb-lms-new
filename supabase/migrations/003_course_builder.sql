alter table courses add column if not exists course_type text default 'online' check(course_type in('online','onsite','hybrid'));
alter table courses add column if not exists language text default 'English';
alter table courses add column if not exists subject text;
alter table courses add column if not exists organization_id uuid references organizations(id);
alter table courses add column if not exists tags text[] default '{}';
alter table courses add column if not exists short_description text;
alter table courses add column if not exists video_source text check(video_source in('upload','youtube'));
alter table courses add column if not exists video_url text;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('course-media','course-media',true,104857600,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']) on conflict(id) do update set public=true;
