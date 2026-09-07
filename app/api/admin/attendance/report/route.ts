import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

export async function GET(request: Request) {
  const auth = createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user || !(await adminActorCan(user.id, "class_reports", "access")))
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url),
    month =
      url.searchParams.get("month") || new Date().toISOString().slice(0, 7),
    courseId = url.searchParams.get("courseId") || "",
    batchId = url.searchParams.get("batchId") || "",
    studentId = url.searchParams.get("studentId") || "";
  const monthStart = `${month}-01`;
  const nextMonth = new Date(`${monthStart}T00:00:00Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  const monthEnd = nextMonth.toISOString().slice(0, 10);
  const db = createAdminClient();
  const [coursesResult, batchesResult, studentsResult] = await Promise.all([
    db.from("courses").select("id,title").order("title"),
    db.from("batches").select("id,batch_name,course_id").order("batch_name"),
    db
      .from("profiles")
      .select("id,full_name,email,avatar_url")
      .eq("role", "student")
      .order("full_name"),
  ]);
  const courses = coursesResult.data || [],
    batches = batchesResult.data || [],
    students = studentsResult.data || [];
  let allowedBatchIds = batches
    .filter((batch) => !courseId || batch.course_id === courseId)
    .map((batch) => batch.id);
  if (batchId) allowedBatchIds = allowedBatchIds.filter((id) => id === batchId);
  if (!allowedBatchIds.length)
    return Response.json({
      counts: { present: 0, absent: 0, late: 0 },
      rows: [],
      options: { courses, batches, students },
    });

  let query = db
    .from("class_attendance")
    .select("class_id,batch_id,student_id,status,attendance_date")
    .gte("attendance_date", monthStart)
    .lt("attendance_date", monthEnd)
    .in("batch_id", allowedBatchIds);
  if (studentId) query = query.eq("student_id", studentId);
  const { data: attendance, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const groups = new Map<
    string,
    {
      studentId: string;
      batchId: string;
      present: number;
      total: number;
      days: Record<string, "present" | "absent" | "late">;
    }
  >();
  for (const item of attendance || []) {
    const key = `${item.student_id}:${item.batch_id}`;
    const group: {
      studentId: string;
      batchId: string;
      present: number;
      total: number;
      days: Record<string, "present" | "absent" | "late">;
    } = groups.get(key) || {
      studentId: item.student_id,
      batchId: item.batch_id,
      present: 0,
      total: 0,
      days: {},
    };
    const status = item.status as "present" | "absent" | "late";
    group.total += 1;
    if (status === "present") group.present += 1;
    const day = String(Number(item.attendance_date.slice(8, 10)));
    const current = group.days[day];
    const priority = { present: 1, late: 2, absent: 3 };
    if (!current || priority[status] > priority[current])
      group.days[day] = status;
    groups.set(key, group);
  }
  const rows = Array.from(groups.values()).map((group) => {
    const student = students.find((item) => item.id === group.studentId),
      batch = batches.find((item) => item.id === group.batchId),
      course = courses.find((item) => item.id === batch?.course_id);
    return {
      id: `${group.studentId}-${group.batchId}`,
      avatar: student?.avatar_url || null,
      studentName: student?.full_name || "Student",
      email: student?.email || "",
      course: course?.title || "Course",
      batch: batch?.batch_name || "Batch",
      days: group.days,
      ratio: Math.round((group.present / Math.max(group.total, 1)) * 100),
    };
  });
  return Response.json({
    counts: {
      present: (attendance || []).filter((item) => item.status === "present")
        .length,
      absent: (attendance || []).filter((item) => item.status === "absent")
        .length,
      late: (attendance || []).filter((item) => item.status === "late").length,
    },
    rows,
    options: { courses, batches, students },
  });
}
