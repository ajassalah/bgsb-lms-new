alter table lessons add column if not exists description text;
update storage.buckets set
  file_size_limit=209715200,
  allowed_mime_types=array[
    'video/mp4','audio/mpeg','application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain','image/jpeg','image/png','image/gif',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
where id='course-media';
