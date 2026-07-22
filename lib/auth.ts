import {redirect} from 'next/navigation';
import {createClient} from './supabase/server';
import type {Role} from './types';
export async function getProfile(){const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data}=await db.from('profiles').select('*').eq('id',user.id).single();return data as ({id:string;full_name:string;email:string;role:Role;organization_id:string|null}|null)}
export async function requireProfile(role?:Role){const p=await getProfile();if(!p)redirect('/login');if(role&&p.role!==role)redirect(`/dashboard/${p.role.replace('_','-')}`);return p}
