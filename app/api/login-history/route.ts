import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single(),
    admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
  if (profile?.role !== "student") return Response.json({ ok: true });
  const ua = req.headers.get("user-agent") || "",
    browser = /Edg\//.test(ua)
      ? "Microsoft Edge"
      : /Chrome\//.test(ua)
        ? "Google Chrome"
        : /Firefox\//.test(ua)
          ? "Mozilla Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown",
    platform = /Windows/.test(ua)
      ? "Windows"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Mac OS/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Unknown",
    ip = (
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "Unknown"
    )
      .split(",")[0]
      .trim();
  await admin
    .from("student_login_history")
    .insert({ student_id: user.id, browser, platform, ip_address: ip });
  return Response.json({ ok: true });
}
