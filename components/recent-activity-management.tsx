"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { TablePagination } from "./table-pagination";
export type ActivityRow = {
  id: string;
  action: string;
  description: string;
  created_at: string;
  ip_address: string | null;
  actor: { full_name: string; email: string; avatar_url: string | null } | null;
};
export function RecentActivityManagement({ rows }: { rows: ActivityRow[] }) {
  const [q, setQ] = useState(""),
    [date, setDate] = useState(""),
    [page, setPage] = useState(1),
    filtered = useMemo(
      () =>
        rows.filter(
          (x) =>
            (!date || x.created_at.slice(0, 10) === date) &&
            `${x.actor?.full_name || ""} ${x.actor?.email || ""} ${x.action} ${x.description}`
              .toLowerCase()
              .includes(q.toLowerCase()),
        ),
      [rows, q, date],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 20)),
    visible = filtered.slice((page - 1) * 20, page * 20);
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">System Settings</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Recent Activity</h1>
      </div>
      <section className="mt-6 rounded-2xl border bg-white">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <label className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="field pl-10"
              placeholder="Search user or action..."
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field pl-10"
            />
          </label>
        </div>
        <div className="divide-y">
          {visible.map((x) => (
            <article
              key={x.id}
              className="flex flex-wrap items-center gap-4 p-4 sm:px-6"
            >
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
                <b className="text-sm text-navy">
                  {x.actor?.full_name || "System User"}
                </b>
                <span className="ml-2 text-xs text-slate-400">
                  {x.actor?.email}
                </span>
                <p className="mt-1 text-sm">
                  <span className="font-bold uppercase text-red">
                    {x.action}
                  </span>{" "}
                  · {x.description}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>
                  {new Date(x.created_at).toLocaleString("en-LK", {
                    timeZone: "Asia/Colombo",
                  })}
                </div>
                <div>IP: {x.ip_address || "Unknown"}</div>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <p className="p-12 text-center text-slate-400">
              No matching activity.
            </p>
          )}
        </div>
        <TablePagination page={page} total={pages} onChange={setPage} />
      </section>
    </>
  );
}
