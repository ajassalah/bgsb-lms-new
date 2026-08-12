import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (p?.role !== "super_admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File))
    return Response.json({ error: "CSV file required" }, { status: 400 });
  const rows = Papa.parse<any>(await file.text(), {
      header: true,
      skipEmptyLines: true,
    }).data,
    admin = createAdminClient(),
    { data: cats } = await admin.from("categories").select("id,name");
  let imported = 0,
    failed = 0;
  for (const row of rows) {
    if (!row.title) {
      failed++;
      continue;
    }
    const category = (cats || []).find(
        (x) =>
          x.name.toLowerCase() === String(row.category || "").toLowerCase(),
      ),
      slug = `${String(row.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now().toString(36)}-${imported}`;
    const { error } = await admin
      .from("courses")
      .insert({
        title: row.title,
        slug,
        category_id: category?.id || null,
        course_type: ["online", "onsite", "hybrid"].includes(row.course_type)
          ? row.course_type
          : "online",
        language: row.language || "English",
        duration_weeks: Math.max(1, Number(row.duration_months || 1) * 4),
        short_description: row.short_description || row.title,
        description: row.description || row.short_description || row.title,
        status: ["draft", "published"].includes(row.status)
          ? row.status
          : "draft",
        tags: [],
      });
    error ? failed++ : imported++;
  }
  return Response.json({ imported, failed });
}
