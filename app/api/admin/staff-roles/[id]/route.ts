import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
const reservedPortalRoles = ["Instructor", "Student"];
async function ok(action: "edit" | "delete") {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  const { data } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return (
    data?.role === "super_admin" ||
    (data?.role === "admin_staff" &&
      (await adminActorCan(user.id, "roles", action)))
  );
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await ok("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const p = z
    .object({ name: z.string().trim().min(2), permissions: z.record(z.any()) })
    .safeParse(await req.json());
  if (!p.success)
    return Response.json({ error: "Invalid role" }, { status: 400 });
  if (
    reservedPortalRoles.some(
      (role) => role.toLowerCase() === p.data.name.toLowerCase(),
    )
  )
    return Response.json(
      {
        error:
          "Instructor and Student use separate portals and cannot be staff roles",
      },
      { status: 400 },
    );
  const admin = createAdminClient();
  const { data: currentRole } = await admin
    .from("staff_roles")
    .select("name")
    .eq("id", params.id)
    .single();
  const { error } = await admin
    .from("staff_roles")
    .update({ ...p.data, updated_at: new Date().toISOString() })
    .eq("id", params.id);
  if (!error && currentRole) {
    const { data: affectedStaff } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "admin_staff")
      .eq("staff_role", currentRole.name);
    const staffIds = (affectedStaff || []).map((staff) => staff.id);
    if (staffIds.length) {
      await admin
        .from("profiles")
        .update({ staff_role: p.data.name })
        .in("id", staffIds);
      await admin
        .from("admin_permissions")
        .delete()
        .in("admin_staff_id", staffIds);
      const rows = staffIds.flatMap((staffId) =>
        Object.entries(
          p.data.permissions as Record<string, Record<string, boolean>>,
        ).map(([module, actions]) => ({
          admin_staff_id: staffId,
          module,
          actions,
          can_view: Object.values(actions).some(Boolean),
          can_create: !!actions.create || !!actions.bulk_import,
          can_edit: !!actions.edit || !!actions.status,
          can_delete: !!actions.delete,
        })),
      );
      if (rows.length) await admin.from("admin_permissions").insert(rows);
    }
  }
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await ok("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("staff_roles")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
