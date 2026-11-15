import {redirect} from 'next/navigation';
import {createClient} from './supabase/server';
import {createAdminClient} from './supabase/admin';
import type {Role} from './types';
export async function getProfile(){const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data,error}=await createAdminClient().from('profiles').select('*').eq('id',user.id).maybeSingle();if(!data)console.warn('[auth] profile lookup failed',{userId:user.id,error:error?.message??'no profile row'});return data as ({id:string;full_name:string;email:string;role:Role;organization_id:string|null;avatar_url:string|null}|null)}
export async function requireProfile(role?:Role){const p=await getProfile();if(!p)redirect('/login');if(role&&p.role!==role)redirect(`/dashboard/${p.role.replace('_','-')}`);return p}
