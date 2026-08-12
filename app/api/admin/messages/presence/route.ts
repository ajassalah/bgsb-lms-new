import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function currentUser() {
  const { data: { user } } = await createClient().auth.getUser();
  return user;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await createAdminClient().from("profiles").select("id,last_login_at").neq("id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ users: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date().toISOString();
  const { error } = await createAdminClient().from("profiles").update({ last_login_at: now }).eq("id", user.id);
  return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json({ lastSeen: now });
}
