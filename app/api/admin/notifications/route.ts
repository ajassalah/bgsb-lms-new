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
    [{ data: tickets }, { data: announcements }] = await Promise.all([
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
  return Response.json({ items });
}
