import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ items: [] });
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (p?.role !== "super_admin") return Response.json({ items: [] });
  const now = new Date().toISOString(),
    [{ data: tickets }, { data: announcements }, { data: reads }] =
      await Promise.all([
        db
          .from("support_tickets")
          .select("id,subject,created_at")
          .in("status", ["open", "pending"])
          .order("created_at", { ascending: false })
          .limit(5),
        db
          .from("announcements")
          .select("id,title,created_at")
          .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
          .order("created_at", { ascending: false })
          .limit(5),
        db
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", user.id),
      ]);
  const items = [
    ...(tickets || []).map((x) => ({
      id: `t-${x.id}`,
      title: `Ticket: ${x.subject}`,
      url: "/dashboard/super-admin/support/tickets",
      date: x.created_at,
    })),
    ...(announcements || []).map((x) => ({
      id: `a-${x.id}`,
      title: x.title,
      url: `/dashboard/super-admin/announcements/${x.id}`,
      date: x.created_at,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 8);
  const readIds = new Set((reads || []).map((item) => item.notification_id));
  return Response.json({
    items: items.filter((item) => !readIds.has(item.id)),
  });
}
export async function POST(request: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json(),
    ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.length > 0,
        )
      : [];
  if (!ids.length) return Response.json({ ok: true });
  const { error } = await db.from("notification_reads").upsert(
    ids.map((notification_id: string) => ({
      user_id: user.id,
      notification_id,
    })),
    { onConflict: "user_id,notification_id" },
  );
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
