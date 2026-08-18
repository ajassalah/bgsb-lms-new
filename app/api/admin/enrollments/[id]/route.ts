import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailTransport, getEmailConfiguration } from "@/lib/email";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );
}
async function admin(action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  return (await adminActorCan(user.id, "enrollment", action))
    ? createAdminClient()
    : null;
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const db = await admin(body.student_id || body.course_id ? "edit" : "status");
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      status: z.enum(["pending", "approved", "declined", "completed"]),
      student_id: z.string().uuid().optional(),
      course_id: z.string().uuid().optional(),
    })
    .safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Invalid enrollment details" },
      { status: 400 },
    );
  const { data: previous } = await db
    .from("enrollments")
    .select("student_id,course_id,status")
    .eq("id", params.id)
    .maybeSingle();
  if (!previous)
    return Response.json({ error: "Enrollment not found" }, { status: 404 });
  const values: any = { ...parsed.data };
  if (parsed.data.student_id) {
    const { data: student } = await db
      .from("profiles")
      .select("organization_id")
      .eq("id", parsed.data.student_id)
      .eq("role", "student")
      .maybeSingle();
    if (!student)
      return Response.json({ error: "Student not found" }, { status: 404 });
    values.organization_id = student.organization_id;
  }
  const { error } = await db
    .from("enrollments")
    .update(values)
    .eq("id", params.id);
  if (error)
    return Response.json(
      {
        error:
          error.code === "23505"
            ? "Student is already enrolled in this course"
            : error.message,
      },
      { status: 400 },
    );

  const studentId = parsed.data.student_id || previous.student_id,
    courseId = parsed.data.course_id || previous.course_id,
    newlyApproved =
      parsed.data.status === "approved" &&
      (previous.status !== "approved" ||
        studentId !== previous.student_id ||
        courseId !== previous.course_id);
  let emailWarning: string | undefined;
  if (newlyApproved) {
    const [{ data: student }, { data: course }] = await Promise.all([
      db
        .from("profiles")
        .select("full_name,email")
        .eq("id", studentId)
        .maybeSingle(),
      db.from("courses").select("title").eq("id", courseId).maybeSingle(),
    ]);
    const studentName = student?.full_name || "Student",
      courseName = course?.title || "your course";
    await db.from("user_notifications").insert({
      user_id: studentId,
      title: `You have been enrolled in ${courseName}`,
      url: "/dashboard/student/courses",
    });
    if (student?.email) {
      try {
        const config = await getEmailConfiguration();
        if (!config?.smtp_host || !config.from_email)
          throw new Error("SMTP email configuration is incomplete");
        await emailTransport(config).sendMail({
          from: `${config.from_name} <${config.from_email}>`,
          to: student.email,
          subject: `Enrollment confirmed – ${courseName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.65"><h2>Course enrollment confirmed 🎓</h2><p>Dear <strong>${escapeHtml(studentName)}</strong>,</p><p>Your enrollment has been approved. You are now enrolled in:</p><div style="padding:16px;background:#f4f7fb;border-radius:10px;font-size:18px"><strong>${escapeHtml(courseName)}</strong></div><p>You can sign in to the BGSB LMS and access the course from your My Courses page.</p><p>Warm regards,<br>Academic &amp; Student Support Team<br>British Graduate School of Business</p></div>`,
        });
      } catch (emailError) {
        emailWarning = `Enrollment approved and notification sent, but email delivery failed: ${emailError instanceof Error ? emailError.message : "Unknown email error"}`;
      }
    } else {
      emailWarning =
        "Enrollment approved and notification sent, but the student has no email address.";
    }
  }
  return Response.json({ ok: true, emailWarning });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const db = await admin("delete");
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await db.from("enrollments").delete().eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
