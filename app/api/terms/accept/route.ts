import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const [{ data: terms }, { data: profile }] = await Promise.all([
    admin
      .from("legal_terms")
      .select("id,version")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);
  if (!terms)
    return Response.json(
      { error: "Published Terms were not found" },
      { status: 404 },
    );
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const { error } = await admin.from("terms_acceptances").upsert(
    {
      user_id: user.id,
      terms_id: terms.id,
      terms_version: terms.version,
      accepted_at: new Date().toISOString(),
      ip_address: forwarded || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "user_id,terms_version" },
  );
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({
    ok: true,
    route: `/dashboard/${String(profile?.role || "student").replace("_", "-")}`,
  });
}
