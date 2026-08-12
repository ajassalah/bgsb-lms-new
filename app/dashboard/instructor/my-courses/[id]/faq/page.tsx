import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
export default async function CourseFaq() {
  const profile = await requireProfile("instructor");
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <p className="text-sm text-slate-400">My Courses / FAQ</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Course FAQ</h1>
      <section className="mt-6 rounded-2xl border bg-white p-10 text-center text-slate-400">
        Course questions and answers will appear here.
      </section>
    </DashboardShell>
  );
}
