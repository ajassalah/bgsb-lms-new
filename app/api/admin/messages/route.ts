import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function user() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return ["super_admin", "admin_staff", "instructor", "student"].includes(p?.role || "")
    ? user
    : null;
}
export async function GET(request: Request) {
  const me = await user();
  if (!me) return Response.json({ error: "Forbidden" }, { status: 403 });
  const other = new URL(request.url).searchParams.get("user_id");
  if (!other) return Response.json({ messages: [] });
  const admin = createAdminClient();
  const [{ data, error }] = await Promise.all([
    admin.from("direct_messages").select("id,sender_id,recipient_id,body,attachment_url,attachment_name,attachment_type,created_at").or(`and(sender_id.eq.${me.id},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me.id})`).order("created_at"),
    admin.from("direct_messages").update({ read_at: new Date().toISOString() }).eq("sender_id", other).eq("recipient_id", me.id).is("read_at", null),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ messages: data || [] });
}
export async function POST(request: Request) {
  const me = await user();
  if (!me) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData(),
    recipient = String(form.get("recipient_id") || ""),
    body = String(form.get("body") || "").trim(),
    file = form.get("attachment");
  if (!recipient || (!body && (!(file instanceof File) || !file.size)))
    return Response.json(
      { error: "Enter a message or choose a file" },
      { status: 400 },
    );
  const admin = createAdminClient();
  let attachment_url: null | string = null,
    attachment_name: null | string = null,
    attachment_type: null | string = null;
  if (file instanceof File && file.size) {
    const path = `messages/${me.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`;
    const { error } = await admin.storage
      .from("course-media")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    attachment_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
    attachment_name = file.name;
    attachment_type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : "file";
  }
  const { data, error } = await admin
    .from("direct_messages")
    .insert({
      sender_id: me.id,
      recipient_id: recipient,
      body: body || null,
      attachment_url,
      attachment_name,
      attachment_type,
    })
    .select(
      "id,sender_id,recipient_id,body,attachment_url,attachment_name,attachment_type,created_at",
    )
    .single();
  if (!error && data) {
    const [{ data: sender }, { data: recipientProfile }] = await Promise.all([
      admin.from("profiles").select("full_name").eq("id", me.id).maybeSingle(),
      admin.from("profiles").select("role").eq("id", recipient).maybeSingle(),
    ]);
    const messageUrl = recipientProfile?.role === "instructor" ? "/dashboard/instructor/messages" : recipientProfile?.role === "student" ? "/dashboard/student/messages" : "/dashboard/super-admin/messages";
    await admin.from("user_notifications").insert({ user_id: recipient, title: `New message from ${sender?.full_name || "a user"}`, url: messageUrl });
  }
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
