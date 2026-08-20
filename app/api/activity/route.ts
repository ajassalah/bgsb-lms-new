import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  action: z.enum(["visit", "click"]),
  path: z.string().startsWith("/dashboard/").max(500),
  label: z.string().trim().max(180).optional(),
  target: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const { action, path, label, target } = parsed.data;
  const description =
    action === "visit"
      ? `Visited ${friendlyPath(path)}`
      : `Clicked “${label || "control"}” on ${friendlyPath(path)}`;
  const ip = (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "Unknown"
  )
    .split(",")[0]
    .trim();
  const { error } = await createAdminClient()
    .from("admin_activity_logs")
    .insert({
      actor_id: user.id,
      action,
      entity_type: action === "visit" ? "page" : "interface",
      entity_id: path,
      description,
      metadata: { path, target: target || null, label: label || null },
      ip_address: ip,
      user_agent: request.headers.get("user-agent") || null,
    });
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}

function friendlyPath(path: string) {
  const parts = path
    .split("/")
    .filter(Boolean)
    .slice(2)
    .map((part) => decodeURIComponent(part).replaceAll("-", " "));
  return parts.length ? parts.join(" / ") : "Dashboard";
}
