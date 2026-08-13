"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreVertical,
  PauseCircle,
  Plus,
  Reply,
  Search,
  TicketCheck,
} from "lucide-react";
import { toast } from "sonner";

type Status = "open" | "pending" | "answered" | "on_hold" | "closed";
export type TicketRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  priority: "low" | "medium" | "high";
  created: string;
  status: Status;
};
const statuses: { value: Status; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
  { value: "on_hold", label: "On Hold" },
  { value: "closed", label: "Close" },
];

export function SupportTicketManagement({
  initialRows,
}: {
  initialRows: TicketRow[];
}) {
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [statusMenu, setStatusMenu] = useState<string | null>(null),
    router = useRouter();
  useEffect(() => setRows(initialRows), [initialRows]);
  const filtered = useMemo(
      () =>
        rows.filter((ticket) =>
          `${ticket.name} ${ticket.email} ${ticket.subject} ${ticket.priority} ${ticket.status}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [rows, query],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 20)),
    visible = filtered.slice((page - 1) * 20, page * 20),
    counts = {
      open: rows.filter((ticket) => ticket.status === "open").length,
      on_hold: rows.filter((ticket) => ticket.status === "on_hold").length,
      pending: rows.filter((ticket) => ticket.status === "pending").length,
      closed: rows.filter((ticket) => ticket.status === "closed").length,
    };
  async function updateStatus(ticket: TicketRow, status: Status) {
    const previous = ticket.status;
    setRows((current) =>
      current.map((item) =>
        item.id === ticket.id ? { ...item, status } : item,
      ),
    );
    setMenu(null);
    setStatusMenu(null);
    const res = await fetch(`/api/admin/support-tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setRows((current) =>
        current.map((item) =>
          item.id === ticket.id ? { ...item, status: previous } : item,
        ),
      );
      toast.error("Ticket status update failed");
    } else {
      toast.success("Ticket status updated");
      router.refresh();
    }
  }
  const cards = [
    ["Open Tickets", counts.open, TicketCheck, "bg-blue-50 text-blue-600"],
    ["On Hold", counts.on_hold, PauseCircle, "bg-amber-50 text-amber-600"],
    ["Pending", counts.pending, Clock3, "bg-violet-50 text-violet-600"],
    ["Closed", counts.closed, CheckCircle2, "bg-emerald-50 text-emerald-600"],
  ] as const;
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Communication / Support</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Tickets</h1>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, count, Icon, color]) => (
          <article
            key={label}
            className="flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm"
          >
            <span
              className={`grid size-12 place-items-center rounded-xl ${color}`}
            >
              <Icon className="size-6" />
            </span>
            <div>
              <b className="block text-2xl text-navy">{count}</b>
              <span className="text-sm text-slate-400">{label}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-navy">Tickets</h2>
        <button
          onClick={() =>
            router.push("/dashboard/super-admin/support/tickets/new")
          }
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add New Ticket
        </button>
      </div>
      <section className="mt-4 rounded-xl border bg-white">
        <div className="border-b p-4 sm:p-5">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="field pl-10"
              placeholder="Search name, email or subject..."
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "#",
                  "Name",
                  "Email",
                  "Subject",
                  "Priority",
                  "Created",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th key={header} className="p-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td className="p-4">{(page - 1) * 10 + index + 1}</td>
                  <td className="p-4 font-semibold text-navy">{ticket.name}</td>
                  <td className="p-4 text-slate-500">{ticket.email}</td>
                  <td className="max-w-xs p-4">{ticket.subject}</td>
                  <td className="p-4">
                    <Priority value={ticket.priority} />
                  </td>
                  <td className="p-4">
                    {new Date(ticket.created).toLocaleString("en-GB")}
                  </td>
                  <td className="p-4">
                    <Status value={ticket.status} />
                  </td>
                  <td className="relative p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setMenu(menu === ticket.id ? null : ticket.id);
                          setStatusMenu(null);
                        }}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === ticket.id && (
                      <div className="absolute right-4 top-14 z-[180] w-44 rounded-xl border bg-white p-1 shadow-2xl">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/super-admin/support/tickets/${ticket.id}/reply`,
                            )
                          }
                          className="ticket-action"
                        >
                          <Reply />
                          Reply
                        </button>
                        <button
                          onClick={() =>
                            setStatusMenu(
                              statusMenu === ticket.id ? null : ticket.id,
                            )
                          }
                          className="ticket-action"
                        >
                          <CheckCircle2 />
                          Verify Status
                        </button>
                        {statusMenu === ticket.id && (
                          <div className="border-t p-1">
                            {statuses.map((status) => (
                              <button
                                key={status.value}
                                onClick={() => {
                                  if (
                                    status.value === "closed" ||
                                    status.value === "answered"
                                  )
                                    router.push(
                                      `/dashboard/super-admin/support/tickets/${ticket.id}/reply?status=${status.value}`,
                                    );
                                  else updateStatus(ticket, status.value);
                                }}
                                className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50"
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t p-4">
          {page > 1 && (
            <button
              onClick={() => setPage((current) => current - 1)}
              className="btn-secondary gap-1 px-3 py-2 text-xs disabled:hidden"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
          )}
          {Array.from({ length: pages }, (_, index) => index + 1).map(
            (number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`grid size-9 place-items-center rounded-lg text-sm font-semibold ${
                  page === number
                    ? "bg-navy text-white"
                    : "border bg-white text-slate-500"
                }`}
              >
                {number}
              </button>
            ),
          )}
          {page < pages && (
            <button
              onClick={() => setPage((current) => current + 1)}
              className="btn-secondary gap-1 px-3 py-2 text-xs disabled:hidden"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </section>
      <style jsx global>{`
        .ticket-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.8rem;
          text-align: left;
        }
        .ticket-action:hover {
          background: #f8fafc;
        }
        .ticket-action svg {
          width: 0.9rem;
          height: 0.9rem;
        }
      `}</style>
    </>
  );
}

function Priority({ value }: { value: TicketRow["priority"] }) {
  const color = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red/10 text-red",
  }[value];
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${color}`}
    >
      {value}
    </span>
  );
}

function Status({ value }: { value: Status }) {
  const color = {
      open: "bg-blue-100 text-blue-700",
      pending: "bg-violet-100 text-violet-700",
      answered: "bg-emerald-100 text-emerald-700",
      on_hold: "bg-amber-100 text-amber-700",
      closed: "bg-slate-200 text-slate-600",
    }[value],
    label = statuses.find((item) => item.value === value)?.label || value;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
