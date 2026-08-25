import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!(await adminActorCan(user.id, "curriculum", "bulk_import")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    file = form.get("file"),
    courseId = String(form.get("course_id") || "");
  if (!(file instanceof File) || !courseId)
    return Response.json(
      { error: "CSV and course are required" },
      { status: 400 },
    );
  const rows = Papa.parse<any>(await file.text(), {
      header: true,
      skipEmptyLines: true,
    }).data,
    admin = createAdminClient(),
    modules = new Map<string, string>();
  let imported = 0,
    failed = 0,
    position = 0;
  for (const row of rows) {
    const title = String(row.module_title || "").trim();
    if (!title) {
      failed++;
      continue;
    }
    let moduleId = modules.get(title);
    if (!moduleId) {
      const { data, error } = await admin
        .from("course_modules")
        .insert({
          course_id: courseId,
          title,
          description: String(row.module_description || "").trim() || null,
          position: ++position,
        })
        .select("id")
        .single();
      if (error || !data) {
        failed++;
        continue;
      }
      moduleId = String(data.id);
      modules.set(title, moduleId);
      imported++;
    }
    if (row.lesson_title) {
      const type = ["video", "audio", "document"].includes(row.lesson_type)
          ? row.lesson_type
          : "document",
        { error } = await admin.from("lessons").insert({
          module_id: moduleId,
          title: row.lesson_title,
          content_type: type,
          content_url: row.content_url || "#",
          description: row.description || null,
          position: Number(row.lesson_position || 1),
        });
      error ? failed++ : imported++;
    }
    if (row.quiz_title) {
      const { error } = await admin.from("quizzes").insert({
        course_id: courseId,
        module_id: moduleId,
        title: row.quiz_title,
      });
      error ? failed++ : imported++;
    }
  }
  return Response.json({ imported, failed });
}
