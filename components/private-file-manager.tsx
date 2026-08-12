"use client";
import { useMemo, useRef, useState } from "react";
import {
  Edit3,
  File,
  Folder,
  FolderPlus,
  Grid2X2,
  List,
  MoreVertical,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export type PrivateItem = {
  id: string;
  parent_id: string | null;
  name: string;
  item_type: "file" | "folder";
  size_bytes: number;
  created_at: string;
  updated_at?: string;
  mime_type?: string | null;
  url?: string | null;
};
const LIMIT = 100 * 1024 * 1024;
export function PrivateFileManager({
  initialItems,
}: {
  initialItems: PrivateItem[];
}) {
  const [items, setItems] = useState(initialItems),
    [folder, setFolder] = useState<string | null>(null),
    [view, setView] = useState<"grid" | "list">("grid"),
    [folderModal, setFolderModal] = useState(false),
    [menu, setMenu] = useState<string | null>(null),
    [editing, setEditing] = useState<PrivateItem | null>(null),
    [deleting, setDeleting] = useState<PrivateItem | null>(null),
    input = useRef<HTMLInputElement>(null),
    visible = items.filter((x) => x.parent_id === folder),
    used = useMemo(
      () => items.reduce((n, x) => n + Number(x.size_bytes || 0), 0),
      [items],
    ),
    breadcrumbs = useMemo(() => {
      const result: PrivateItem[] = [];
      let current = folder;
      while (current) {
        const item = items.find((x) => x.id === current);
        if (!item) break;
        result.unshift(item);
        current = item.parent_id;
      }
      return result;
    }, [folder, items]);
  async function upload(file?: File) {
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    if (folder) form.set("parent_id", folder);
    const res = await fetch("/api/private-files", {
        method: "POST",
        body: form,
      }),
      body = await res.json();
    if (!res.ok) return toast.error(body.error || "Upload failed");
    setItems((x) => [body, ...x]);
    if (input.current) input.current.value = "";
    toast.success("File uploaded");
  }
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") || "");
    const res = await fetch("/api/private-files", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, parent_id: folder }),
      }),
      body = await res.json();
    if (!res.ok) return toast.error(body.error || "Folder creation failed");
    setItems((x) => [body, ...x]);
    setFolderModal(false);
    toast.success("Folder created");
  }
  async function rename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget),
      name = String(form.get("name") || ""),
      parent_id = String(form.get("parent_id") || "") || null;
    const res = await fetch(`/api/private-files/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, parent_id }),
      }),
      body = await res.json();
    if (!res.ok) return toast.error(body.error || "Rename failed");
    setItems((rows) => rows.map((row) => (row.id === editing.id ? body : row)));
    setEditing(null);
    toast.success("Name updated");
  }
  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/private-files/${deleting.id}`, {
        method: "DELETE",
      }),
      body = await res.json();
    if (!res.ok) return toast.error(body.error || "Delete failed");
    const removed = new Set(body.ids || [deleting.id]);
    setItems((rows) => rows.filter((row) => !removed.has(row.id)));
    setDeleting(null);
    toast.success("Item deleted");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Platform / Private File</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Private File</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => input.current?.click()}
            className="btn-primary gap-2"
          >
            <Upload className="size-4" />
            Upload File
          </button>
          <input
            ref={input}
            type="file"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <button
            onClick={() => setFolderModal(true)}
            className="btn-secondary gap-2"
          >
            <FolderPlus className="size-4" />
            Create Folder
          </button>
          <button
            onClick={() => setView("grid")}
            className="grid size-10 place-items-center rounded-lg border"
          >
            <Grid2X2 className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className="grid size-10 place-items-center rounded-lg border"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
      <section className="mt-6 rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={() => setFolder(null)}
              className="font-bold text-red"
            >
              Private File
            </button>
            {breadcrumbs.map((item) => (
              <span key={item.id} className="flex items-center gap-2">
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => setFolder(item.id)}
                  className="font-semibold text-slate-600"
                >
                  {item.name}
                </button>
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {(used / 1024 / 1024).toFixed(1)} MB used ·{" "}
            {((LIMIT - used) / 1024 / 1024).toFixed(1)} MB balance
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-red"
            style={{ width: `${Math.min(100, (used / LIMIT) * 100)}%` }}
          />
        </div>
        <div
          className={
            view === "grid"
              ? "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              : "mt-6 divide-y"
          }
        >
          {visible.map((x) => (
            <article
              key={x.id}
              className={`relative flex text-left ${view === "grid" ? "flex-col rounded-xl border p-5" : "w-full items-center gap-4 py-4"}`}
            >
              <button
                onClick={() => x.item_type === "folder" && setFolder(x.id)}
                className={
                  view === "grid"
                    ? "flex min-w-0 flex-col text-left"
                    : "flex min-w-0 flex-1 items-center gap-4 text-left"
                }
              >
                {x.item_type === "folder" ? (
                  <Folder className="size-10 fill-amber-100 text-amber-500" />
                ) : x.mime_type?.startsWith("image/") && x.url ? (
                  <img
                    src={x.url}
                    alt=""
                    className="h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <File className="size-10 text-blue-500" />
                )}
                <span className={view === "grid" ? "mt-3 min-w-0" : "min-w-0"}>
                  <b className="block truncate text-sm text-navy">{x.name}</b>
                  <small className="mt-1 block text-slate-400">
                    {x.item_type === "file"
                      ? `${(x.size_bytes / 1024 / 1024).toFixed(2)} MB`
                      : "Folder"}
                  </small>
                </span>
              </button>
              <button
                onClick={() => setMenu(menu === x.id ? null : x.id)}
                className="absolute right-2 top-2 grid size-9 place-items-center rounded-lg bg-white hover:bg-slate-100"
              >
                <MoreVertical className="size-4" />
              </button>
              {menu === x.id && (
                <div className="absolute right-2 top-12 z-[100] w-36 rounded-xl border bg-white p-1 shadow-xl">
                  <button
                    onClick={() => {
                      setEditing(x);
                      setMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <Edit3 className="size-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleting(x);
                      setMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red hover:bg-red/5"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
        {!visible.length && (
          <p className="py-14 text-center text-sm text-slate-400">
            This folder is empty.
          </p>
        )}
      </section>
      {folderModal && (
        <Modal
          title="Create Folder"
          submit={create}
          close={() => setFolderModal(false)}
          name=""
          button="Create"
        />
      )}
      {editing && (
        <EditModal
          item={editing}
          folders={items.filter(
            (x) => x.item_type === "folder" && x.id !== editing.id,
          )}
          submit={rename}
          close={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${deleting?.item_type || "item"}?`}
        description={
          deleting?.item_type === "folder"
            ? "This folder and every file and subfolder inside it will be permanently deleted."
            : "This file will be permanently deleted."
        }
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
function EditModal({
  item,
  folders,
  submit,
  close,
}: {
  item: PrivateItem;
  folders: PrivateItem[];
  submit: (e: React.FormEvent<HTMLFormElement>) => void;
  close: () => void;
}) {
  const [dimensions, setDimensions] = useState("—");
  return (
    <div className="fixed inset-0 z-[230] grid place-items-center bg-black/50 p-3">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-2xl bg-white p-5"
      >
        <h2 className="font-bold text-navy">
          Edit {item.item_type === "folder" ? "Folder" : "File"}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-[220px_1fr]">
          <div className="grid min-h-48 place-items-center overflow-hidden rounded-xl bg-slate-100">
            {item.item_type === "folder" ? (
              <Folder className="size-20 fill-amber-100 text-amber-500" />
            ) : item.mime_type?.startsWith("image/") && item.url ? (
              <img
                src={item.url}
                alt="Preview"
                onLoad={(e) =>
                  setDimensions(
                    `${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight} px`,
                  )
                }
                className="size-full max-h-64 object-contain"
              />
            ) : (
              <File className="size-20 text-blue-500" />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold">
              {item.item_type === "folder" ? "Folder" : "File"} Name
              <input
                name="name"
                defaultValue={item.name}
                className="field mt-2"
                required
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Path
              <select
                name="parent_id"
                defaultValue={item.parent_id || ""}
                className="field mt-2"
              >
                <option value="">Private File / Root</option>
                {folders.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <Meta
                label="Last modified"
                value={new Date(
                  item.updated_at || item.created_at,
                ).toLocaleString("en-GB")}
              />
              <Meta
                label="Created"
                value={new Date(item.created_at).toLocaleString("en-GB")}
              />
              <Meta
                label="Size"
                value={
                  item.item_type === "file"
                    ? `${(item.size_bytes / 1024 / 1024).toFixed(2)} MB`
                    : "Folder"
                }
              />
              <Meta
                label="Dimensions"
                value={item.item_type === "file" ? dimensions : "—"}
              />
            </dl>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-navy">{value}</dd>
    </div>
  );
}
function Modal({
  title,
  submit,
  close,
  name,
  button,
}: {
  title: string;
  submit: (e: React.FormEvent<HTMLFormElement>) => void;
  close: () => void;
  name: string;
  button: string;
}) {
  return (
    <div className="fixed inset-0 z-[230] grid place-items-center bg-black/50 p-3">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-5"
      >
        <h2 className="font-bold text-navy">{title}</h2>
        <label className="mt-4 block text-sm font-semibold">
          Name
          <input
            name="name"
            defaultValue={name}
            autoFocus
            className="field mt-2"
            required
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button className="btn-primary">{button}</button>
        </div>
      </form>
    </div>
  );
}
