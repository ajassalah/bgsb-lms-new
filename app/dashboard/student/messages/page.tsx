import { DashboardShell } from "@/components/dashboard-shell";
import { MessageCenter } from "@/components/message-center";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentMessages() {
  const p = await requireProfile("student"),
    db = createAdminClient();
  const { data: enrollments } = await db
    .from("enrollments")
    .select("course_id")
    .eq("student_id", p.id)
    .in("status", ["approved", "completed"]);
  const courseIds = Array.from(
    new Set((enrollments || []).map((row) => row.course_id)),
  );
  const [
    { data: staff },
    { data: instructors },
    { data: classmates },
    { data: favorites },
  ] = await Promise.all([
    db
      .from("profiles")
      .select("id,full_name,email,avatar_url,role,phone,status,last_login_at")
      .eq("role", "admin_staff")
      .eq("status", "active"),
    courseIds.length
      ? db
          .from("course_instructors")
          .select(
            "instructor:profiles!course_instructors_instructor_id_fkey(id,full_name,email,avatar_url,role,phone,status,last_login_at)",
          )
          .in("course_id", courseIds)
      : Promise.resolve({ data: [] as any[] }),
    courseIds.length
      ? db
          .from("enrollments")
          .select(
            "student:profiles!enrollments_student_id_fkey(id,full_name,email,avatar_url,role,phone,status,last_login_at)",
          )
          .in("course_id", courseIds)
          .in("status", ["approved", "completed"])
          .neq("student_id", p.id)
      : Promise.resolve({ data: [] as any[] }),
    db.from("message_favorites").select("favorite_user_id").eq("user_id", p.id),
  ]);
  const contacts = [
    ...(staff || []),
    ...(instructors || []).map((x: any) => x.instructor),
    ...(classmates || []).map((x: any) => x.student),
  ].filter(Boolean);
  const users = Array.from(
    new Map(contacts.map((x: any) => [x.id, x])).values(),
  ) as any[];
  return (
    <DashboardShell
      role="student"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <MessageCenter
        currentUser={{ id: p.id, name: p.full_name, avatar: p.avatar_url }}
        users={users.map((x) => ({
          id: x.id,
          name: x.full_name,
          email: x.email,
          avatar: x.avatar_url,
          role: x.role,
          phone: x.phone,
          status: x.status,
          lastLogin: x.last_login_at,
        }))}
        initialFavorites={(favorites || []).map((x) => x.favorite_user_id)}
      />
    </DashboardShell>
  );
}
