import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await db
    .from("profiles")
    .select("full_name,avatar_url")
    .eq("id", user.id)
    .single();
  return Response.json({
    name: data?.full_name || user.email || "User",
    avatar: data?.avatar_url || null,
  });
}
