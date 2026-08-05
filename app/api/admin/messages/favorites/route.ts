import { createClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { favorite_user_id, favorite } = await request.json();
  const query = favorite
    ? db
        .from("message_favorites")
        .upsert({ user_id: user.id, favorite_user_id })
    : db
        .from("message_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("favorite_user_id", favorite_user_id);
  const { error } = await query;
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
