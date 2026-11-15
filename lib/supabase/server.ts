import {createServerClient,type CookieOptions} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {createAdminClient} from './admin';
type CookieToSet={name:string;value:string;options:CookieOptions};

function createSessionClient(jar:ReturnType<typeof cookies>){return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll(items:CookieToSet[]){try{items.forEach(({name,value,options})=>jar.set(name,value,options))}catch{}}}})}

/**
 * Server-side Supabase client.
 *
 * - `auth`, `rpc`, `storage` use the signed-in user's session (cookie JWT), so
 *   `auth.getUser()` still verifies the caller and database functions that rely
 *   on `auth.uid()` keep working.
 * - Table access (`.from()`) uses the service-role client. The database API on
 *   the hosted Supabase does not return rows for user-session requests, which
 *   left pages built on this client empty while pages using the admin client
 *   worked. Every caller of `.from()` here is gated in code first (middleware +
 *   `requireProfile(role)` on pages, `getUser()` + `adminActorCan()` / role or
 *   `user.id` checks in API routes), so access rules are enforced by the app.
 */
export function createClient():ReturnType<typeof createSessionClient>{
  const jar=cookies();
  const session=createSessionClient(jar);
  let admin:ReturnType<typeof createAdminClient>|null=null;
  return new Proxy(session,{
    get(target,prop,receiver){
      if(prop==='from'){
        admin??=createAdminClient();
        return admin.from.bind(admin);
      }
      return Reflect.get(target,prop,receiver);
    },
  });
}
