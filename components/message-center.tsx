"use client";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  FileText,
  Edit3,
  Image as ImageIcon,
  Info,
  Mic,
  Paperclip,
  Search,
  Send,
  Star,
  StopCircle,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  phone: string | null;
  status: string;
  lastLogin: string | null;
};
type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: "image" | "video" | "audio" | "file" | null;
  created_at: string;
};
const Avatar = ({
  user,
  size = "size-10",
}: {
  user: { name: string; avatar: string | null };
  size?: string;
}) =>
  user.avatar ? (
    <img
      src={user.avatar}
      alt=""
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white`}
    >
      {user.name[0]}
    </span>
  );

export function MessageCenter({
  currentUser,
  users,
  initialFavorites,
}: {
  currentUser: { id: string; name: string; avatar: string | null };
  users: User[];
  initialFavorites: string[];
}) {
  const [selected, setSelected] = useState<User | null>(users[0] || null),
    [query, setQuery] = useState(""),
    [messages, setMessages] = useState<Message[]>([]),
    [loadingMessages, setLoadingMessages] = useState(false),
    [unreadByUser, setUnreadByUser] = useState<Record<string, number>>({}),
    [presence, setPresence] = useState<Record<string, string | null>>(() => Object.fromEntries(users.map((user) => [user.id, user.lastLogin]))),
    [favorites, setFavorites] = useState(initialFavorites),
    [info, setInfo] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [sending, setSending] = useState(false),
    [recording, setRecording] = useState(false),
    [editing, setEditing] = useState<Message | null>(null),
    [editBody, setEditBody] = useState(""),
    [deleting, setDeleting] = useState<Message | null>(null);
  const media = useRef<MediaRecorder | null>(null),
    chunks = useRef<Blob[]>([]),
    bottom = useRef<HTMLDivElement | null>(null),
    selectedId = useRef<string | null>(users[0]?.id || null);
  const filtered = users.filter((u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
    ),
    favouriteUsers = users.filter((u) => favorites.includes(u.id));
  async function load(id: string) {
    const res = await fetch(`/api/admin/messages?user_id=${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (selectedId.current !== id) return;
      setMessages(data.messages || []);
      setUnreadByUser((counts) => ({ ...counts, [id]: 0 }));
      window.dispatchEvent(new Event("messages-read"));
      setTimeout(() => bottom.current?.scrollIntoView(), 0);
    }
  }
  useEffect(() => {
    if (!selected) return;
    selectedId.current = selected.id;
    setMessages([]);
    setLoadingMessages(true);
    load(selected.id).finally(() => setLoadingMessages(false));
    const timer = setInterval(() => load(selected.id), 5000);
    return () => clearInterval(timer);
  }, [selected?.id]);
  useEffect(() => {
    let active = true;
    const refresh = () => fetch("/api/admin/messages/unread", { cache: "no-store" }).then((x) => x.json()).then((x) => { if (active) setUnreadByUser(x.byUser || {}); }).catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  useEffect(() => {
    let mounted = true;
    const heartbeat = () => fetch("/api/admin/messages/presence", { method: "POST" }).catch(() => {});
    const refreshPresence = () => fetch("/api/admin/messages/presence", { cache: "no-store" }).then((x) => x.json()).then((x) => { if (mounted) setPresence(Object.fromEntries((x.users || []).map((user: { id: string; last_login_at: string | null }) => [user.id, user.last_login_at]))); }).catch(() => {});
    heartbeat();
    refreshPresence();
    const heartbeatTimer = window.setInterval(heartbeat, 60000);
    const presenceTimer = window.setInterval(refreshPresence, 30000);
    return () => { mounted = false; window.clearInterval(heartbeatTimer); window.clearInterval(presenceTimer); };
  }, []);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const formElement = event.currentTarget,
      data = new FormData(formElement);
    data.set("recipient_id", selected.id);
    if (file) data.set("attachment", file);
    setSending(true);
    const res = await fetch("/api/admin/messages", {
        method: "POST",
        body: data,
      }),
      body = await res.json();
    setSending(false);
    if (!res.ok) return toast.error(body.error || "Message failed");
    setMessages((x) => [...x, body]);
    setFile(null);
    formElement.reset();
    setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }
  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/messages/${editing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: editBody }),
    });
    if (!res.ok) return toast.error((await res.json()).error || "Edit failed");
    setMessages((rows) =>
      rows.map((row) =>
        row.id === editing.id ? { ...row, body: editBody.trim() } : row,
      ),
    );
    setEditing(null);
    toast.success("Message updated");
  }
  async function deleteMessage() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/messages/${deleting.id}`, {
      method: "DELETE",
    });
    if (!res.ok)
      return toast.error((await res.json()).error || "Delete failed");
    setMessages((rows) => rows.filter((row) => row.id !== deleting.id));
    setDeleting(null);
    toast.success("Message deleted");
  }
  async function favourite(user: User) {
    const value = !favorites.includes(user.id);
    setFavorites((x) =>
      value ? [...x, user.id] : x.filter((id) => id !== user.id),
    );
    await fetch("/api/admin/messages/favorites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ favorite_user_id: user.id, favorite: value }),
    });
  }
  async function record() {
    if (recording) {
      media.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }),
        recorder = new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setFile(
          new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }),
        );
        stream.getTracks().forEach((x) => x.stop());
        setRecording(false);
      };
      media.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access was not available");
    }
  }
  const active = (u: User) =>
    !!presence[u.id] &&
    Date.now() - new Date(presence[u.id]!).getTime() < 2 * 60 * 1000;
  const lastSeen = (value: string | null) => value
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : null;
  return (
    <div
      data-message-center
      className="-m-3 flex h-[calc(100vh-70px)] min-h-[620px] overflow-hidden border bg-white sm:-m-5 lg:-m-8 lg:h-[calc(100vh-78px)]"
    >
      <aside
        className={`${selected ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r md:w-80 lg:w-96`}
      >
        <div className="border-b p-4">
          <h1 className="text-xl font-bold text-navy">Messages</h1>
          <p className="mt-4 text-xs font-bold uppercase text-slate-400">
            Favourites
          </p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {favouriteUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className="shrink-0 text-center"
              >
                <span className="relative inline-block"><Avatar user={u} />{unreadByUser[u.id] > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-5 text-white">{unreadByUser[u.id] > 99 ? "99+" : unreadByUser[u.id]}</span>}</span>
                <span className="mt-1 block max-w-14 truncate text-[9px] text-slate-500">
                  {u.name.split(" ")[0]}
                </span>
              </button>
            ))}
            {!favouriteUsers.length && (
              <p className="py-3 text-xs text-slate-400">
                Star users to add favourites.
              </p>
            )}
          </div>
        </div>
        <label className="relative m-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm"
          />
        </label>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${selected?.id === u.id ? "bg-red/10" : "hover:bg-slate-50"}`}
            >
              <span className="relative">
                <Avatar user={u} />
                {active(u) && (
                  <i className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </span>
              <span className="min-w-0">
                <b className="block truncate text-sm text-navy">{u.name}</b>
                <small className="block truncate text-slate-400">
                  {u.email}
                </small>
              </span>
              {unreadByUser[u.id] > 0 && <span className="ml-auto grid min-w-6 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-6 text-white">{unreadByUser[u.id] > 99 ? "99+" : unreadByUser[u.id]}</span>}
            </button>
          ))}
        </div>
      </aside>
      {selected ? (
        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
            <button
              onClick={() => setSelected(null)}
              className="grid size-9 place-items-center md:hidden"
            >
              <X className="size-5" />
            </button>
            <Avatar user={selected} />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-navy">{selected.name}</b>
              <span
                className={`text-xs ${active(selected) ? "text-emerald-600" : "text-slate-400"}`}
              >
                {active(selected)
                  ? "Active now"
                  : presence[selected.id] || selected.lastLogin
                    ? `Last seen ${lastSeen(presence[selected.id] || selected.lastLogin)}`
                    : "Not logged in yet"}
              </span>
            </div>
            <button
              onClick={() => setInfo((x) => !x)}
              className="grid size-10 place-items-center rounded-lg border"
            >
              <Info className="size-4" />
            </button>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-3 sm:p-6">
            {loadingMessages && <div className="grid h-full place-items-center text-sm text-slate-400">Loading conversation...</div>}
            {messages.map((m) => {
              const mine = m.sender_id === currentUser.id,
                person = mine ? currentUser : selected;
              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${mine ? "justify-end" : ""}`}
                >
                  {!mine && <Avatar user={person} size="size-8" />}
                  <div
                    className={`max-w-[78%] rounded-2xl p-3 ${mine ? "rounded-br-sm bg-navy text-white" : "rounded-bl-sm bg-white text-navy shadow-sm"}`}
                  >
                    {m.attachment_type === "image" && (
                      <img
                        src={m.attachment_url!}
                        className="mb-2 max-h-72 rounded-xl object-cover"
                      />
                    )}
                    {m.attachment_type === "video" && (
                      <video
                        src={m.attachment_url!}
                        controls
                        className="mb-2 max-h-72 rounded-xl"
                      />
                    )}
                    {m.attachment_type === "audio" && (
                      <audio
                        src={m.attachment_url!}
                        controls
                        className="mb-2 max-w-full"
                      />
                    )}
                    {m.attachment_type === "file" && (
                      <a
                        href={m.attachment_url!}
                        download
                        className="mb-2 flex items-center gap-2 rounded-lg border p-2 text-xs"
                      >
                        <FileText className="size-4" />
                        {m.attachment_name}
                      </a>
                    )}
                    {m.body && (
                      <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                    )}
                    {mine && (
                      <div className="mt-2 flex justify-end gap-1 border-t border-white/10 pt-1">
                        {m.body && (
                          <button
                            onClick={() => {
                              setEditing(m);
                              setEditBody(m.body || "");
                            }}
                            className="grid size-7 place-items-center rounded hover:bg-white/10"
                            aria-label="Edit message"
                          >
                            <Edit3 className="size-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleting(m)}
                          className="grid size-7 place-items-center rounded hover:bg-white/10"
                          aria-label="Delete message"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    )}
                    <time
                      className={`mt-1 block text-right text-[9px] ${mine ? "text-white/55" : "text-slate-400"}`}
                    >
                      {new Date(m.created_at).toLocaleTimeString("en-LK", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {mine && <Avatar user={person} size="size-8" />}
                </div>
              );
            })}
            <div ref={bottom} />
          </div>
          {file && (
            <div className="flex items-center gap-2 border-t px-4 py-2 text-xs">
              <Paperclip className="size-4" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <button onClick={() => setFile(null)}>
                <X className="size-4" />
              </button>
            </div>
          )}
          <form
            data-skip-confirmation="true"
            onSubmit={send}
            className="flex shrink-0 items-center gap-2 border-t p-3"
          >
            <label className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg border">
              <Paperclip className="size-4" />
              <input
                type="file"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFile(e.target.files?.[0] || null)
                }
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip"
              />
            </label>
            <button
              type="button"
              onClick={record}
              className={`grid size-10 shrink-0 place-items-center rounded-lg border ${recording ? "bg-red text-white" : ""}`}
            >
              {recording ? (
                <StopCircle className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </button>
            <input
              name="body"
              autoComplete="off"
              placeholder="Write a message…"
              className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm"
            />
            <button
              disabled={sending}
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-red text-white"
            >
              <Send className="size-4" />
            </button>
          </form>
          {info && (
            <aside className="absolute inset-y-0 right-0 z-20 w-72 border-l bg-white p-5 shadow-2xl">
              <button
                onClick={() => setInfo(false)}
                className="ml-auto grid size-9 place-items-center"
              >
                <X className="size-4" />
              </button>
              <div className="mt-8 text-center">
                <span className="inline-block">
                  <Avatar user={selected} size="size-24" />
                </span>
                <h2 className="mt-3 font-bold text-navy">{selected.name}</h2>
                <p className="text-xs text-slate-400">{selected.email}</p>
                <button
                  onClick={() => favourite(selected)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                >
                  <Star
                    className={`size-4 ${favorites.includes(selected.id) ? "fill-amber-400 text-amber-400" : ""}`}
                  />
                  {favorites.includes(selected.id)
                    ? "Remove favourite"
                    : "Add favourite"}
                </button>
              </div>
              <dl className="mt-8 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Role</dt>
                  <dd className="mt-1 capitalize text-navy">
                    {selected.role.replaceAll("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Phone</dt>
                  <dd className="mt-1 text-navy">
                    {selected.phone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Status</dt>
                  <dd className="mt-1 capitalize text-navy">
                    {selected.status}
                  </dd>
                </div>
              </dl>
            </aside>
          )}
        </section>
      ) : (
        <div className="hidden flex-1 place-items-center text-slate-400 md:grid">
          Select a user to start messaging.
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[230] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
          <form
            data-skip-confirmation="true"
            onSubmit={saveEdit}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-navy">Edit Message</h2>
            <textarea
              autoFocus
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="field mt-4 min-h-28"
              required
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button className="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Message?"
        description="This message will be permanently removed from the conversation."
        confirmLabel="Delete Message"
        onCancel={() => setDeleting(null)}
        onConfirm={deleteMessage}
      />
    </div>
  );
}
