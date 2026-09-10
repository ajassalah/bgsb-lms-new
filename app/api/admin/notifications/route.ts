import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function isLiveClassNotification(title: string) {
  return title.toLowerCase().startsWith("live class scheduled:");
}

function liveClassTitle(title: string) {
  return title.replace(/^live class scheduled:\s*/i, "").trim();
}

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
  const admin = createAdminClient();
  // Login popups should not revive stale announcements or notifications.
  const activeSince = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: directNotifications } = await admin
    .from("user_notifications")
    .select("id,title,url,created_at")
    .eq("user_id", user.id)
    .is("read_at", null)
    .gte("created_at", activeSince)
    .order("created_at", { ascending: false })
    .limit(20);
  const nowIso = new Date().toISOString();
  let visibleDirectNotifications = directNotifications || [];
  if (
    p?.role &&
    ["admin_staff", "instructor", "student"].includes(p.role) &&
    visibleDirectNotifications.some((item) =>
      isLiveClassNotification(item.title),
    )
  ) {
    let liveRows: { title: string; scheduled_end: string }[] = [];
    if (p.role === "instructor") {
      const [{ data: links }, { data: direct }] = await Promise.all([
        admin
          .from("live_session_instructors")
          .select("session:live_sessions(title,scheduled_end)")
          .eq("instructor_id", user.id),
        admin
          .from("live_sessions")
          .select("title,scheduled_end")
          .eq("instructor_id", user.id),
      ]);
      liveRows = [
        ...(links || []).map((row: any) => row.session).filter(Boolean),
        ...(direct || []),
      ];
    } else {
      const table =
        p.role === "student" ? "live_session_students" : "live_session_staff";
      const key = p.role === "student" ? "student_id" : "staff_id";
      const { data } = await admin
        .from(table)
        .select("session:live_sessions(title,scheduled_end)")
        .eq(key, user.id);
      liveRows = (data || []).map((row: any) => row.session).filter(Boolean);
    }
    const activeLiveClasses = new Set(
      liveRows
        .filter((row) => row.scheduled_end && row.scheduled_end >= nowIso)
        .map((row) => row.title),
    );
    visibleDirectNotifications = visibleDirectNotifications.filter(
      (item) =>
        !isLiveClassNotification(item.title) ||
        activeLiveClasses.has(liveClassTitle(item.title)),
    );
  }
  const notificationRole = p?.role === "admin_staff" ? "admin_staff" : p?.role;
  const [{ data: roleAnnouncements }, { data: commonReads }] =
    notificationRole && notificationRole !== "super_admin"
      ? await Promise.all([
          admin
            .from("announcements")
            .select("id,title,created_at")
            .contains("receiver_types", [notificationRole])
            .gte("created_at", activeSince)
            .or(
              `scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`,
            )
            .order("created_at", { ascending: false })
            .limit(20),
          admin
            .from("notification_reads")
            .select("notification_id")
            .eq("user_id", user.id),
        ])
      : [{ data: [] }, { data: [] }];
  const roleAnnouncementItems = (roleAnnouncements || []).map((item) => ({
    id: `a-${item.id}`,
    title: `Announcement: ${item.title}`,
    url:
      p?.role === "student"
        ? `/dashboard/student/announcements`
        : p?.role === "instructor"
          ? `/dashboard/instructor/announcements`
          : `/dashboard/admin-staff/announcements/${item.id}`,
    date: item.created_at,
  }));
  if (p?.role === "admin_staff") {
    const readIds = new Set(
      (commonReads || []).map((row) => row.notification_id),
    );
    const items = [
      ...visibleDirectNotifications.map((x) => ({
        id: `u-${x.id}`,
        title: x.title,
        url: x.url,
        date: x.created_at,
      })),
      ...roleAnnouncementItems,
    ]
      .filter((item) => !readIds.has(item.id))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 20);
    return Response.json({
      items,
    });
  }
  if (p?.role !== "super_admin")
    return Response.json({
      items: [
        ...visibleDirectNotifications.map((x) => ({
          id: `u-${x.id}`,
          title: x.title,
          url: x.url,
          date: x.created_at,
        })),
        ...roleAnnouncementItems,
      ]
        .filter(
          (item) =>
            !(commonReads || []).some(
              (read) => read.notification_id === item.id,
            ),
        )
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 20),
    });
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
          .gte("created_at", activeSince)
          .order("created_at", { ascending: false })
          .limit(5),
        db
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", user.id),
      ]);
  const items = [
    ...(directNotifications || []).map((x) => ({
      id: `u-${x.id}`,
      title: x.title,
      url: x.url,
      date: x.created_at,
    })),
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
  const userNotificationIds = ids
    .filter((id) => id.startsWith("u-"))
    .map((id) => id.slice(2));
  if (userNotificationIds.length)
    await db
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .in("id", userNotificationIds);
  const standardIds = ids.filter((id) => !id.startsWith("u-"));
  if (!standardIds.length) return Response.json({ ok: true });
  const { error } = await db.from("notification_reads").upsert(
    standardIds.map((notification_id: string) => ({
      user_id: user.id,
      notification_id,
    })),
    { onConflict: "user_id,notification_id" },
  );
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
