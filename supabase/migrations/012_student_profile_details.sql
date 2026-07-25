alter table profiles add column if not exists first_name text;
alter table profiles add column if not exists last_name text;
alter table profiles add column if not exists address text;
alter table profiles add column if not exists date_of_birth date;
alter table profiles add column if not exists gender text check(gender in('male','female','other','prefer_not_to_say'));
alter table profiles add column if not exists country text;
alter table profiles add column if not exists about text;
alter table profiles add column if not exists nic_passport text;
alter table profiles add column if not exists phone_country_code text;
