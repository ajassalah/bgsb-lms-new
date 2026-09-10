"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  MoreVertical,
  PauseCircle,
  Plus,
  Reply,
  Search,
  TicketCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useIsStaffPortal, useStaffCan } from "./staff-permission-context";

type Status = "open" | "pending" | "answered" | "on_hold" | "closed";
export type TicketRow = {
  id: string;
  ticketNo: string;
  roleName: string;
  name: string;
  email: string;
  subject: string;
  priority: "low" | "medium" | "high";
  created: string;
  status: Status;
};
type TicketDetail = TicketRow & {
  description: string;
  attachment_url: string | null;
  created_by_name: string;
  replies: {
    id: string;
    message: string;
    attachment_url: string | null;
    created_at: string;
    replier_name: string;
  }[];
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
  const basePath = useIsStaffPortal()
    ? "/dashboard/admin-staff/support/tickets"
    : "/dashboard/super-admin/support/tickets";
  const canView = useStaffCan("tickets", "view"),
    canCreate = useStaffCan("tickets", "create"),
    canReply = useStaffCan("tickets", "reply"),
    canVerifyStatus = useStaffCan("tickets", "verify_status");
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [statusMenu, setStatusMenu] = useState<string | null>(null),
    [viewing, setViewing] = useState<TicketDetail | null>(null),
    [viewBusy, setViewBusy] = useState<string | null>(null),
    router = useRouter();
  useEffect(() => setRows(initialRows), [initialRows]);
  const filtered = useMemo(
      () =>
        rows.filter((ticket) =>
          `${ticket.ticketNo} ${ticket.roleName} ${ticket.name} ${ticket.email} ${ticket.subject} ${ticket.priority} ${ticket.status}`
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
  async function openView(ticket: TicketRow) {
    setMenu(null);
    setViewBusy(ticket.id);
    const res = await fetch(`/api/admin/support-tickets/${ticket.id}`);
    const body = await res.json().catch(() => ({}));
    setViewBusy(null);
    if (!res.ok) return toast.error(body.error || "Ticket view failed");
    setViewing({
      ...ticket,
      description: body.description || "",
      attachment_url: body.attachment_url || null,
      roleName: body.role_name || ticket.roleName || "",
      created_by_name:
        body.creator?.full_name || body.student?.full_name || ticket.name,
      replies: (body.replies || []).map((reply: any) => ({
        id: reply.id,
        message: reply.message || "",
        attachment_url: reply.attachment_url || null,
        created_at: reply.created_at,
        replier_name: reply.replier?.full_name || "Staff",
      })),
    });
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
        {canCreate && (
          <button
            onClick={() => router.push(`${basePath}/new`)}
            className="btn-primary gap-2"
          >
            <Plus className="size-4" />
            Add New Ticket
          </button>
        )}
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
          <table className="w-full min-w-[1140px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "#",
                  "Ticket No",
                  "Role",
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
                  <td className="p-4 font-bold text-navy">
                    {ticket.ticketNo || "-"}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {ticket.roleName || "-"}
                  </td>
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
                      <div className="ticket-menu absolute right-4 top-14 z-[180] w-44 rounded-xl border bg-white p-1 shadow-2xl">
                        {canView && (
                          <button
                            onClick={() => openView(ticket)}
                            className="ticket-action"
                          >
                            <Eye />
                            {viewBusy === ticket.id ? "Loading..." : "View"}
                          </button>
                        )}
                        {canReply && (
                          <button
                            onClick={() =>
                              router.push(`${basePath}/${ticket.id}/reply`)
                            }
                            className="ticket-action"
                          >
                            <Reply />
                            Reply
                          </button>
                        )}
                        {canVerifyStatus && (
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
                        )}
                        {canVerifyStatus && statusMenu === ticket.id && (
                          <div className="ticket-status-menu border-t p-1">
                            {statuses.map((status) => (
                              <button
                                key={status.value}
                                onClick={() => {
                                  if (
                                    status.value === "closed" ||
                                    status.value === "answered"
                                  )
                                    router.push(
                                      `${basePath}/${ticket.id}/reply?status=${status.value}`,
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
                  <td colSpan={10} className="p-12 text-center text-slate-400">
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
      {viewing && (
        <TicketViewModal
          ticket={viewing}
          close={() => setViewing(null)}
          reply={() => router.push(`${basePath}/${viewing.id}/reply`)}
        />
      )}
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
        @media (max-width: 640px) {
          .ticket-menu {
            position: fixed !important;
            left: 0.75rem !important;
            right: 0.75rem !important;
            bottom: 0.75rem !important;
            top: auto !important;
            width: auto !important;
            z-index: 280 !important;
            border-radius: 1rem;
            padding: 0.5rem;
          }
          .ticket-action {
            min-height: 3rem;
            font-size: 0.95rem;
          }
          .ticket-status-menu {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.25rem;
          }
        }
      `}</style>
    </>
  );
}

function TicketViewModal({
  ticket,
  close,
  reply,
}: {
  ticket: TicketDetail;
  close: () => void;
  reply: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[260] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Support / Tickets / View</p>
            <h2 className="mt-1 break-words text-2xl font-bold text-navy">
              {ticket.subject}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="grid size-9 shrink-0 place-items-center rounded-lg border"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="Ticket No" value={ticket.ticketNo} />
          <Info label="Priority" value={ticket.priority} />
          <Info label="Status" value={ticket.status.replace("_", " ")} />
          <Info
            label="Created"
            value={new Date(ticket.created).toLocaleString("en-GB")}
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Role" value={ticket.roleName || "Not assigned"} />
          <Info label="Created By" value={ticket.created_by_name || "-"} />
        </div>
        <div
          className="prose mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: ticket.description }}
        />
        {(ticket.status === "answered" || ticket.status === "closed") && (
          <section className="mt-6 rounded-xl border bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-navy">Response</h3>
            {ticket.replies.length ? (
              <div className="mt-3 space-y-4">
                {ticket.replies.map((reply) => (
                  <article key={reply.id} className="rounded-lg bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b className="text-sm text-navy">{reply.replier_name}</b>
                      <span className="text-xs text-slate-400">
                        {new Date(reply.created_at).toLocaleString("en-GB")}
                      </span>
                    </div>
                    <div
                      className="prose mt-3 max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: reply.message }}
                    />
                    {reply.attachment_url && (
                      <a
                        href={reply.attachment_url}
                        target="_blank"
                        className="btn-secondary mt-3"
                      >
                        View Response Attachment
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No response has been recorded.
              </p>
            )}
          </section>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {ticket.attachment_url && (
            <a
              href={ticket.attachment_url}
              target="_blank"
              className="btn-secondary"
            >
              View Attachment
            </a>
          )}
          <button type="button" onClick={close} className="btn-secondary">
            Close
          </button>
          <button type="button" onClick={reply} className="btn-primary gap-2">
            <Reply className="size-4" />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase text-slate-400">
        {label}
      </span>
      <b className="mt-1 block capitalize text-navy">{value}</b>
    </div>
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
