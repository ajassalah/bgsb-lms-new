import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, count, error } = await createAdminClient()
    .from("direct_messages")
    .select("sender_id", { count: "exact" })
    .eq("recipient_id", user.id)
    .is("read_at", null);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const byUser = (data || []).reduce<Record<string, number>>((result, row) => {
    result[row.sender_id] = (result[row.sender_id] || 0) + 1;
    return result;
  }, {});
  return Response.json({ count: count || 0, byUser }, { headers: { "Cache-Control": "no-store" } });
}
