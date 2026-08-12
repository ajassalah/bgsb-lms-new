import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("admin_activity_logs")
      .select(
        "id,action,description,created_at,actor:profiles!admin_activity_logs_actor_id_fkey(full_name,email,avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
  return (
    <StaffPageShell name={p.full_name}>
      <p className="text-sm text-slate-400">System Settings</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Recent Activity</h1>
      <section className="mt-7 rounded-2xl border bg-white">
        <div className="divide-y">
          {(data || []).map((x: any) => (
            <article key={x.id} className="flex items-center gap-4 p-4 sm:px-6">
              {x.actor?.avatar_url ? (
                <img
                  src={x.actor.avatar_url}
                  className="size-11 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-11 place-items-center rounded-full bg-navy font-bold text-white">
                  {x.actor?.full_name?.[0] || "U"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <b className="block text-sm text-navy">
                  {x.actor?.full_name || "System User"}
                </b>
                <span className="block truncate text-xs text-slate-400">
                  {x.actor?.email || "â€”"}
                </span>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-bold uppercase text-red">
                    {x.action}
                  </span>{" "}
                  Â· {x.description}
                </p>
              </div>
              <time className="text-right text-xs text-slate-400">
                {new Date(x.created_at).toLocaleString("en-LK", {
                  timeZone: "Asia/Colombo",
                })}
              </time>
            </article>
          ))}
        </div>
      </section>
    </StaffPageShell>
  );
}
