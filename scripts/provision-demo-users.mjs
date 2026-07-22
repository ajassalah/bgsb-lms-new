import fs from 'node:fs';
import crypto from 'node:crypto';
import {createClient} from '@supabase/supabase-js';

for(const line of fs.readFileSync('.env','utf8').split(/\r?\n/)){
  const match=line.match(/^([^#][^=]*)=(.*)$/);
  if(match)process.env[match[1].trim()]=match[2].trim().replace(/^['"]|['"]$/g,'');
}
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Supabase URL or service role key missing');
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:orgs,error:orgReadError}=await db.from('organizations').select('id').eq('name','BGSB Demo Organization').limit(1);
if(orgReadError)throw orgReadError;
let organizationId=orgs?.[0]?.id;
if(!organizationId){const {data,error}=await db.from('organizations').insert({name:'BGSB Demo Organization',contact_email:'organization@bgsb-lms.test'}).select('id').single();if(error)throw error;organizationId=data.id}
const accounts=[
  ['super_admin','super.admin@bgsb-lms.test','Super Administrator',null],
  ['admin_staff','admin.staff@bgsb-lms.test','Admin Staff',null],
  ['organization','organization@bgsb-lms.test','Demo Organization',organizationId],
  ['org_staff','org.staff@bgsb-lms.test','Organization Staff',organizationId],
  ['instructor','instructor@bgsb-lms.test','Demo Instructor',null],
  ['student','student@bgsb-lms.test','Demo Student',organizationId]
];
const output=[];
for(const [role,email,full_name,organization_id] of accounts){
  const password=`Bg!${crypto.randomBytes(9).toString('base64url')}9`;
  const {data:list,error:listError}=await db.auth.admin.listUsers({page:1,perPage:1000});if(listError)throw listError;
  let user=list.users.find(x=>x.email?.toLowerCase()===email);
  if(user){const {error}=await db.auth.admin.updateUserById(user.id,{password,email_confirm:true,user_metadata:{full_name}});if(error)throw error}
  else{const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name}});if(error)throw error;user=data.user}
  const {error:profileError}=await db.from('profiles').upsert({id:user.id,email,full_name,role,organization_id,status:'active'},{onConflict:'id'});if(profileError)throw profileError;
  output.push({role,email,password});
}
console.log(JSON.stringify(output,null,2));
