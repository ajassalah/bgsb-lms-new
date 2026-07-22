import {createClient} from '@supabase/supabase-js';
export function createAdminClient(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Missing service role key');return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,key,{auth:{autoRefreshToken:false,persistSession:false}})}
