"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  FileQuestion,
  Filter,
  GraduationCap,
  ListTree,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { useIsStaffPortal, useStaffCan } from "./staff-permission-context";

export type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryId: string;
  students: number;
  status: string;
};

export function CourseManagement({
  initialCourses,
  categories,
}: {
  initialCourses: AdminCourse[];
  categories: { id: string; name: string }[];
}) {
  const isStaff = useIsStaffPortal();
  const basePath = isStaff
    ? "/dashboard/admin-staff"
    : "/dashboard/super-admin";
  const canBulk = useStaffCan("courses", "bulk_import"),
    canCreate = useStaffCan("courses", "create"),
    canEdit = useStaffCan("courses", "edit"),
    canStudents = useStaffCan("courses", "manage_student"),
    canInstructors = useStaffCan("courses", "manage_instructor"),
    canCurriculum = useStaffCan("courses", "curriculum"),
    canFaq = useStaffCan("courses", "faq"),
    canPublish = useStaffCan("courses", "published_toggle"),
    canDelete = useStaffCan("courses", "delete");
  const [courses, setCourses] = useState(initialCourses),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [status, setStatus] = useState("all"),
    [filters, setFilters] = useState(false),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<AdminCourse | null>(null);
  const searchRef = useRef<HTMLInputElement>(null),
    router = useRouter();
  useEffect(() => setCourses(initialCourses), [initialCourses]);
  useEffect(() => {
    if (filters) searchRef.current?.focus();
  }, [filters]);
  useEffect(() => setPage(1), [query, category, status]);
  const filtered = useMemo(
      () =>
        courses.filter(
          (x) =>
            x.title.toLowerCase().includes(query.toLowerCase()) &&
            (category === "all" || x.categoryId === category) &&
            (status === "all" || x.status === status),
        ),
      [courses, query, category, status],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 15)),
    visible = filtered.slice((page - 1) * 15, page * 15);
  async function toggle(c: AdminCourse) {
    const next = c.status === "published" ? "draft" : "published";
    setCourses((x) =>
      x.map((y) => (y.id === c.id ? { ...y, status: next } : y)),
    );
    const res = await fetch(`/api/admin/courses/${c.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setCourses((x) => x.map((y) => (y.id === c.id ? c : y)));
      toast.error("Update failed");
    } else {
      toast.success(`Course ${next}`);
      router.refresh();
    }
  }
  async function remove(c: AdminCourse) {
    setMenu(null);
    const res = await fetch(`/api/admin/courses/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      setCourses((x) => x.filter((y) => y.id !== c.id));
      setDeleting(null);
      toast.success("Course deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Courses / Course List</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Course List</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create, publish and manage all BGSB learning courses.
          </p>
        </div>
        <div className="flex gap-2">
          {canBulk && (
            <BulkImportDialog
              label="Courses"
              endpoint="/api/admin/bulk/courses"
              template={`title,category,course_type,language,duration_months,short_description,description,status\nStrategic Leadership,Business,online,English,6,Leadership fundamentals,Complete leadership programme,draft`}
            />
          )}
          <button
            onClick={() => setFilters((x) => !x)}
            className={`flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold ${filters ? "border-red text-red" : "text-navy"}`}
          >
            <Filter className="size-4" />
            Filter
          </button>
          {canCreate && (
            <button
              onClick={() => router.push(`${basePath}/courses/new`)}
              className="btn-primary gap-2 rounded-lg py-2.5"
            >
              <Plus className="size-4" />
              Add New Course
            </button>
          )}
        </div>
      </div>
      {filters && (
        <div className="mt-5 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_220px_200px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              className="field py-2.5 pl-10 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search course title..."
            />
          </label>
          <select
            aria-label="Category"
            className="field py-2.5 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((x) => (
              <option value={x.id} key={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Status"
            className="field py-2.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={() => {
              setQuery("");
              setCategory("all");
              setStatus("all");
              setFilters(false);
            }}
            className="px-3 text-xs font-bold text-red"
          >
            Reset & close
          </button>
        </div>
      )}
      <section className="mt-7 overflow-visible rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <label className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-red/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course title..."
            />
          </label>
          <span className="text-xs text-slate-400">
            Showing {visible.length} of {filtered.length}
          </span>
        </div>
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Title – Course Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Enrolled Student</th>
                <th className="p-4">Status</th>
                <th className="p-4">Published</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((c, i) => (
                <tr className="hover:bg-slate-50" key={c.id}>
                  <td className="p-4 text-slate-400">
                    {(page - 1) * 15 + i + 1}
                  </td>
                  <td className="p-4">
                    <b className="block max-w-xs text-navy">{c.title}</b>
                    <small className="text-slate-400">/{c.slug}</small>
                  </td>
                  <td className="p-4">{c.category}</td>
                  <td className="p-4">
                    <span className="flex gap-2">
                      <Users className="size-4 text-slate-400" />
                      {c.students}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${c.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {canPublish && (
                      <button
                        onClick={() => toggle(c)}
                        className={`relative h-6 w-11 rounded-full ${c.status === "published" ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <span
                          className={`absolute top-1 size-4 rounded-full bg-white transition ${c.status === "published" ? "left-6" : "left-1"}`}
                        />
                      </button>
                    )}
                  </td>
                  <td className="relative p-4">
                    {(canEdit ||
                      canStudents ||
                      canInstructors ||
                      canCurriculum ||
                      canFaq ||
                      canDelete) && (
                      <div className="flex justify-end">
                        <button
                          aria-label={`Actions for ${c.title}`}
                          onClick={() => setMenu(menu === c.id ? null : c.id)}
                          className="grid size-9 place-items-center rounded-lg border bg-white text-slate-500 hover:bg-slate-50"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    )}
                    {menu === c.id && (
                      <ActionMenu
                        course={c}
                        close={() => setMenu(null)}
                        remove={() => {
                          setMenu(null);
                          setDeleting(c);
                        }}
                        basePath={basePath}
                        permissions={{
                          canEdit,
                          canStudents,
                          canInstructors,
                          canCurriculum,
                          canFaq,
                          canDelete,
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-400">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <small className="text-slate-400">15 courses per page</small>
          <div className="flex items-center gap-1">
            <Nav disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft />
              Previous
            </Nav>
            {Array.from({ length: pages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.max(5, page + 2))
              .map((n) => (
                <button
                  onClick={() => setPage(n)}
                  className={`grid size-9 place-items-center rounded-lg text-sm ${n === page ? "bg-red text-white" : "border"}`}
                  key={n}
                >
                  {n}
                </button>
              ))}
            <Nav disabled={page === pages} onClick={() => setPage(page + 1)}>
              Next
              <ChevronRight />
            </Nav>
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Delete Course?"
        description={`Are you sure you want to delete ${deleting?.title || "this course"}? This action cannot be undone.`}
        confirmLabel="Delete Course"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
    </>
  );
}

function ActionMenu({
  course,
  close,
  remove,
  basePath,
  permissions,
}: {
  course: AdminCourse;
  close: () => void;
  remove: () => void;
  basePath: string;
  permissions: {
    canEdit: boolean;
    canStudents: boolean;
    canInstructors: boolean;
    canCurriculum: boolean;
    canFaq: boolean;
    canDelete: boolean;
  };
}) {
  return (
    <div className="absolute right-4 top-14 z-[100] w-56 overflow-hidden rounded-xl border bg-white py-1 text-left shadow-2xl">
      {permissions.canEdit && (
        <a
          href={`${basePath}/courses/${course.id}/edit`}
          onClick={close}
          className="menu-action"
        >
          <Edit3 className="size-4 text-blue-600" />
          Edit Course
        </a>
      )}
      {permissions.canStudents && (
        <a
          href={`${basePath}/courses/${course.id}/students`}
          onClick={close}
          className="menu-action"
        >
          <Users className="size-4 text-blue-600" />
          Manage Students
        </a>
      )}
      {permissions.canInstructors && (
        <a
          href={`${basePath}/courses/${course.id}/instructors`}
          onClick={close}
          className="menu-action"
        >
          <GraduationCap className="size-4 text-blue-600" />
          Manage Instructor
        </a>
      )}
      {permissions.canCurriculum && (
        <a
          href={`${basePath}/courses/${course.id}/curriculum`}
          onClick={close}
          className="menu-action"
        >
          <ListTree className="size-4 text-blue-600" />
          Curriculum
        </a>
      )}
      {permissions.canFaq && (
        <button onClick={close} className="menu-action">
          <FileQuestion className="size-4 text-blue-600" />
          FAQ
        </button>
      )}
      <a
        href="https://bgsb.lk/programs"
        target="_blank"
        rel="noopener noreferrer"
        onClick={close}
        className="menu-action"
      >
        <ExternalLink className="size-4 text-emerald-600" />
        Visit Course
      </a>
      {permissions.canDelete && (
        <>
          <div className="my-1 border-t" />
          <button
            onClick={remove}
            className="menu-action text-red hover:bg-red/5"
          >
            <Trash2 className="size-4" />
            Delete Course
          </button>
        </>
      )}
      <style jsx>{`
        .menu-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: #334155;
        }
        .menu-action:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}
function Nav({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
    >
      {children}
    </button>
  );
}
