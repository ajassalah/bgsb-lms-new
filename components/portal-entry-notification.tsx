"use client";

import { BellRing, ExternalLink, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EntryItem = {
  id: string;
  title: string;
  url: string;
  date: string;
  actor?: string;
  email?: string;
  avatar?: string | null;
};

export function PortalEntryNotification() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [items, setItems] = useState<EntryItem[]>([]);
  const supported =
    /^\/dashboard\/(super-admin|admin-staff|instructor|student|organization|org-staff)$/.test(
      pathname,
    );

  useEffect(() => {
    if (!supported) {
      setItems([]);
      return;
    }
    const timer = window.setTimeout(() => {
      fetch("/api/admin/notifications", { cache: "no-store" })
        .then((response) => response.json())
        .then((body) => setItems(Array.isArray(body.items) ? body.items : []))
        .catch(() => null);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [supported, pathname]);

  async function read(item: EntryItem, open: boolean) {
    setItems((rows) => rows.filter((row) => row.id !== item.id));
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [item.id] }),
    }).catch(() => null);
    window.dispatchEvent(new Event("notifications-read"));
    if (open && item.url) router.push(item.url);
  }

  async function closeAll() {
    const ids = items.map((item) => item.id);
    if (!ids.length) return;
    setItems([]);
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => null);
    window.dispatchEvent(new Event("notifications-read"));
  }

  if (!items.length) return null;

  return (
    <div className="fixed inset-0 z-[26000] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="lms-popup-card relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl p-5 sm:p-7">
        <button
          onClick={closeAll}
          aria-label="Mark all notifications as read and close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border text-slate-500 hover:bg-slate-50"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-4 pr-10">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red/10 text-red">
            <BellRing className="size-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-red">
              Welcome back
            </p>
            <h2 className="mt-1 text-xl font-bold text-navy">Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">
              You have {items.length} unread{" "}
              {items.length === 1 ? "notification" : "notifications"}.
            </p>
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt=""
                    className="size-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red/10 text-red">
                    <BellRing className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-navy">{item.title}</h3>
                  {item.actor && (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {item.actor}
                      {item.email ? ` · ${item.email}` : ""}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(item.date).toLocaleString("en-GB", {
                      timeZone: "Asia/Colombo",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => read(item, true)}
                className="btn-secondary shrink-0 gap-2"
              >
                Open <ExternalLink className="size-4" />
              </button>
            </article>
          ))}
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
          <button onClick={closeAll} className="btn-primary">
            Mark All Read &amp; Close
          </button>
        </div>
      </section>
    </div>
  );
}
