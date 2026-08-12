import { notFound } from "next/navigation";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { StaffPageShell } from "@/components/staff-page-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CourseManagement,
  type AdminCourse,
} from "@/components/course-management";
const sections = {
  courses: {
    title: "Course List",
    description: "Create and manage all BGSB learning courses.",
  },
  category: {
    title: "Categories",
    description: "Organize courses into searchable academic categories.",
  },
  subjects: {
    title: "Subjects",
    description: "Manage subjects used across course curricula.",
  },
  tag: {
    title: "Tags",
    description: "Maintain discovery tags for course content.",
  },
  level: {
    title: "Levels",
    description: "Configure the qualification and difficulty levels.",
  },
  certificates: {
    title: "Certificates",
    description: "Manage certificate templates and issued credentials.",
  },
} as const;
export default async function CourseAdminPage({
  params,
}: {
  params: { section: string };
}) {
  const config = sections[params.section as keyof typeof sections];
  if (!config) notFound();
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  if (params.section === "courses") {
    const [{ data }, { data: categories }] = await Promise.all([
      db
        .from("courses")
        .select(
          "id,title,slug,status,category_id,category:categories(name),enrollments(count)",
        )
        .order("created_at", { ascending: false }),
      db.from("categories").select("id,name").order("name"),
    ]);
    const courses: AdminCourse[] = (data || []).map((x: any) => ({
      id: x.id,
      title: x.title,
      slug: x.slug,
      status: x.status,
      category: x.category?.name || "Uncategorized",
      categoryId: x.category_id || "",
      students: x.enrollments?.[0]?.count || 0,
    }));
    return (
      <StaffPageShell name={profile.full_name}>
        <CourseManagement
          initialCourses={courses}
          categories={categories || []}
        />
      </StaffPageShell>
    );
  }
  let rows: { id: string; name: string; detail: string; status: string }[] = [];
  if (params.section === "certificates") {
    const { data } = await db
      .from("certificates")
      .select("id,issued_at,student_id,course_id")
      .order("issued_at", { ascending: false })
      .limit(50);
    rows = (data || []).map((x) => ({
      id: x.id,
      name: `Certificate ${x.id.slice(0, 8).toUpperCase()}`,
      detail: new Date(x.issued_at).toLocaleDateString(),
      status: "Issued",
    }));
  }
  return (
    <StaffPageShell name={profile.full_name}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Courses / {config.title}</p>
          <h1 className="mt-1 text-2xl font-bold text-[#17233c]">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>
        <button className="btn-primary gap-2 rounded-lg py-2.5">
          <Plus className="size-4" />
          Add new
        </button>
      </div>
      <section className="mt-7 overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b p-5">
          <label className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border px-4 py-2.5 pl-10 text-sm outline-none focus:ring-2 focus:ring-red/20"
              placeholder={`Search ${config.title.toLowerCase()}...`}
            />
          </label>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-navy">
            <SlidersHorizontal className="size-4" />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 font-semibold text-navy">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.detail}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-red">
                    Manage
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <b className="text-navy">
                      No {config.title.toLowerCase()} yet
                    </b>
                    <p className="mt-1 text-sm text-slate-400">
                      Select â€œAdd newâ€ to create the first entry.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </StaffPageShell>
  );
}
