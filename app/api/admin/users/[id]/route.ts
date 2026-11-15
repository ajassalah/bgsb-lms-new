import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { sendAccountCredentials, sendPasswordResetLink } from "@/lib/email";
import { z } from "zod";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z
    .object({
      action: z.enum(["password", "reset", "status"]),
      value: z.string().optional(),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid action" }, { status: 400 });
  const permission =
    parsed.data.action === "password"
      ? "manage_password"
      : parsed.data.action === "reset"
        ? "send_reset_link"
        : "status";
  if (!(await adminActorCan(user.id, "all_users", permission)))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient(),
    { data: target } = await admin
      .from("profiles")
      .select("email,full_name,role,staff_role")
      .eq("id", params.id)
      .single();
  if (!target)
    return Response.json({ error: "User not found" }, { status: 404 });
  if (parsed.data.action === "status") {
    if (!["active", "suspended"].includes(parsed.data.value || ""))
      return Response.json({ error: "Invalid status" }, { status: 400 });
    const { error } = await admin
      .from("profiles")
      .update({ status: parsed.data.value })
      .eq("id", params.id);
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ message: "Account status updated" });
  }
  if (parsed.data.action === "reset") {
    try {
      const sent = await sendPasswordResetLink({
        email: target.email,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin,
      });
      return sent
        ? Response.json({ message: "Password reset link sent" })
        : Response.json({ error: "No login account exists for this user" }, { status: 400 });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Could not send reset link" },
        { status: 500 },
      );
    }
  }
  if (!parsed.data.value || parsed.data.value.length < 8)
    return Response.json(
      { error: "Password must contain at least 8 characters" },
      { status: 400 },
    );
  const { error } = await admin.auth.admin.updateUserById(params.id, {
    password: parsed.data.value,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  try {
    await sendAccountCredentials({
      to: target.email,
      name: target.full_name,
      role: target.role,
      temporaryPassword: parsed.data.value,
      loginUrl: process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin,
      staffRole: target.staff_role || undefined,
    });
  } catch (e) {
    return Response.json({
      message: "Password updated, but email could not be sent",
    });
  }
  return Response.json({ message: "Password updated and emailed" });
}
