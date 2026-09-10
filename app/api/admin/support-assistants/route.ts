import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffPermissions } from "@/lib/staff-permissions";

async function authorize(action: "view" | "create" | "edit" | "delete") {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "super_admin") return user;
  if (profile?.role === "admin_staff") {
    const permissions = await getStaffPermissions(user.id);
    if (
      permissions.support_assistants?.full_access ||
      permissions.support_assistants?.[action]
    )
      return user;
  }
  return null;
}

const roleSchema = z.object({
  name: z.string().trim().min(2),
});

const assistantSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1),
  role_id: z.string().uuid(),
});

const assistantSelect =
  "id,user_id,role_id,designation,created_at,user:profiles!support_assistants_user_id_fkey(full_name,email,avatar_url,role,staff_role),role:support_assistant_roles(name)";

export async function GET() {
  const user = await authorize("view");
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const [{ data: roles }, { data: assistants }, { data: users }] =
    await Promise.all([
      admin
        .from("support_assistant_roles")
        .select("id,name,created_at")
        .order("name"),
      admin
        .from("support_assistants")
        .select(assistantSelect)
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id,full_name,email,avatar_url,role,staff_role")
        .in("role", ["super_admin", "admin_staff"])
        .eq("status", "active")
        .order("full_name"),
    ]);
  return Response.json({
    roles: roles || [],
    assistants: assistants || [],
    users: users || [],
  });
}

export async function POST(request: Request) {
  const user = await authorize("create");
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const admin = createAdminClient();
  if (body?.type === "role") {
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success)
      return Response.json({ error: "Enter a valid role" }, { status: 400 });
    const { data, error } = await admin
      .from("support_assistant_roles")
      .insert({ name: parsed.data.name })
      .select("id,name,created_at")
      .single();
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json(data);
  }
  const parsed = assistantSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Select staff and role" }, { status: 400 });
  const { data, error } = await admin
    .from("support_assistants")
    .upsert(
      parsed.data.user_ids.map((user_id) => ({
        user_id,
        role_id: parsed.data.role_id,
        designation: "",
      })),
      { onConflict: "user_id" },
    )
    .select(assistantSelect)
    .order("created_at", { ascending: false });
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data || []);
}

export async function PATCH(request: Request) {
  const user = await authorize("edit");
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const admin = createAdminClient();
  if (body?.type === "role") {
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success)
      return Response.json({ error: "Enter a valid role" }, { status: 400 });
    const { data, error } = await admin
      .from("support_assistant_roles")
      .update({ name: parsed.data.name })
      .eq("id", id)
      .select("id,name,created_at")
      .single();
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json(data);
  }
  const parsed = assistantSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Select staff and role" }, { status: 400 });
  const { data: current } = await admin
    .from("support_assistants")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  const { data, error } = await admin
    .from("support_assistants")
    .upsert(
      parsed.data.user_ids.map((user_id) => ({
        user_id,
        role_id: parsed.data.role_id,
        designation: "",
      })),
      { onConflict: "user_id" },
    )
    .select(assistantSelect)
    .order("created_at", { ascending: false });
  if (!error && current && !parsed.data.user_ids.includes(current.user_id)) {
    await admin.from("support_assistants").delete().eq("id", id);
  }
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data || []);
}

export async function DELETE(request: Request) {
  const user = await authorize("delete");
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const table =
    type === "role" ? "support_assistant_roles" : "support_assistants";
  const { error } = await createAdminClient().from(table).delete().eq("id", id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
