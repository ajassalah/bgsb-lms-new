"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  MoreVertical,
  PlusCircle,
  Search,
  Trash2,
  UserRoundPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useStaffCan } from "./staff-permission-context";

type Role = { id: string; name: string; created_at?: string };
type User = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "super_admin" | "admin_staff";
  staff_role: string | null;
};
type Assistant = {
  id: string;
  user_id: string;
  role_id: string;
  designation?: string;
  user: User | null;
  role: { name: string } | null;
};

export function SupportAssistantManagement({
  initialRoles,
  initialAssistants,
  users,
}: {
  initialRoles: Role[];
  initialAssistants: Assistant[];
  users: User[];
}) {
  const canCreate = useStaffCan("support_assistants", "create"),
    canEdit = useStaffCan("support_assistants", "edit"),
    canDelete = useStaffCan("support_assistants", "delete");
  const [roles, setRoles] = useState(initialRoles),
    [assistants, setAssistants] = useState(initialAssistants),
    [assistantModal, setAssistantModal] = useState<Assistant | null | false>(
      false,
    ),
    [roleModal, setRoleModal] = useState<Role | null | false>(false),
    [menu, setMenu] = useState<string | null>(null);

  async function removeAssistant(row: Assistant) {
    const res = await fetch(`/api/admin/support-assistants?id=${row.id}`, {
      method: "DELETE",
    });
    if (!res.ok)
      return toast.error((await res.json()).error || "Delete failed");
    setAssistants((current) => current.filter((item) => item.id !== row.id));
    setMenu(null);
    toast.success("Support assistant deleted");
  }

  async function removeRole(row: Role) {
    const res = await fetch(
      `/api/admin/support-assistants?type=role&id=${row.id}`,
      { method: "DELETE" },
    );
    if (!res.ok)
      return toast.error((await res.json()).error || "Delete failed");
    setRoles((current) => current.filter((item) => item.id !== row.id));
    toast.success("Role deleted");
  }

  function mergeAssistants(rows: Assistant[]) {
    setAssistants((current) => {
      const incoming = new Map(rows.map((row) => [row.id, row]));
      const next = current.map((item) => incoming.get(item.id) || item);
      for (const row of rows) {
        if (!next.some((item) => item.id === row.id)) next.unshift(row);
      }
      return next.filter(
        (item, index, array) =>
          array.findIndex((row) => row.user_id === item.user_id) === index,
      );
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Support</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">
            Support Assistants
          </h1>
        </div>
        {canCreate && (
          <button
            onClick={() => setAssistantModal(null)}
            className="btn-primary gap-2"
          >
            <UserRoundPlus className="size-4" />
            Create
          </button>
        )}
      </div>

      <section className="mt-7 rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-navy">
            Support Assistant Details
          </h2>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assistants.map((row, index) => (
                <tr key={row.id}>
                  <td className="p-4 text-slate-400">{index + 1}</td>
                  <td className="p-4">
                    <UserCell user={row.user} />
                  </td>
                  <td className="p-4">{row.role?.name || "-"}</td>
                  <td className="relative p-4">
                    {(canEdit || canDelete) && (
                      <>
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              setMenu(menu === row.id ? null : row.id)
                            }
                            className="grid size-9 place-items-center rounded-lg border"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </div>
                        {menu === row.id && (
                          <div className="absolute right-4 top-14 z-50 w-36 rounded-xl border bg-white p-1 shadow-xl">
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setAssistantModal(row);
                                  setMenu(null);
                                }}
                                className="assistant-action"
                              >
                                <Edit3 />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => removeAssistant(row)}
                                className="assistant-action text-red"
                              >
                                <Trash2 />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!assistants.length && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    No support assistants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-7 rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <h2 className="text-lg font-bold text-navy">Roles</h2>
          {canCreate && (
            <button
              onClick={() => setRoleModal(null)}
              className="btn-primary gap-2"
            >
              <PlusCircle className="size-4" />
              Create Role
            </button>
          )}
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Edit</th>
                <th className="p-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {roles.map((role, index) => (
                <tr key={role.id}>
                  <td className="p-4 text-slate-400">{index + 1}</td>
                  <td className="p-4 font-semibold text-navy">{role.name}</td>
                  <td className="p-4 text-right">
                    {canEdit && (
                      <button
                        onClick={() => setRoleModal(role)}
                        className="inline-grid size-9 place-items-center rounded-lg border text-blue-600"
                      >
                        <Edit3 className="size-4" />
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {canDelete && (
                      <button
                        onClick={() => removeRole(role)}
                        className="inline-grid size-9 place-items-center rounded-lg border text-red"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!roles.length && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    No support roles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {assistantModal !== false && (
        <AssistantModal
          value={assistantModal}
          roles={roles}
          users={users}
          onCreateRole={() => setRoleModal(null)}
          close={() => setAssistantModal(false)}
          saved={(rows) => {
            mergeAssistants(rows);
            setAssistantModal(false);
          }}
        />
      )}
      {roleModal !== false && (
        <RoleModal
          value={roleModal}
          close={() => setRoleModal(false)}
          saved={(row) => {
            setRoles((current) =>
              roleModal
                ? current.map((item) => (item.id === row.id ? row : item))
                : [...current, row].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  ),
            );
            setRoleModal(false);
          }}
        />
      )}
      <style jsx global>{`
        .assistant-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
        }
        .assistant-action:hover {
          background: #f8fafc;
        }
        .assistant-action svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}

function UserCell({ user }: { user: User | null }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt=""
          className="size-10 rounded-full object-cover"
        />
      ) : (
        <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">
          {user?.full_name?.charAt(0) || "U"}
        </span>
      )}
      <span className="min-w-0">
        <b className="block truncate text-navy">{user?.full_name || "User"}</b>
        <small className="block truncate text-slate-400">
          {user?.email || ""}
        </small>
      </span>
    </div>
  );
}

function AssistantModal({
  value,
  roles,
  users,
  onCreateRole,
  close,
  saved,
}: {
  value: Assistant | null;
  roles: Role[];
  users: User[];
  onCreateRole: () => void;
  close: () => void;
  saved: (rows: Assistant[]) => void;
}) {
  const [userIds, setUserIds] = useState<string[]>(
      value?.user_id ? [value.user_id] : [],
    ),
    [roleId, setRoleId] = useState(value?.role_id || ""),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false);
  const visible = useMemo(
      () =>
        users.filter((user) =>
          `${user.full_name} ${user.email} ${user.staff_role || ""} ${user.role}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [users, query],
    ),
    selectedUsers = users.filter((user) => userIds.includes(user.id));
  function toggleUser(id: string) {
    setUserIds((current) =>
      current.includes(id)
        ? current.filter((userId) => userId !== id)
        : [...current, id],
    );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userIds.length || !roleId) return toast.error("Select staff and role");
    setBusy(true);
    const res = await fetch("/api/admin/support-assistants", {
      method: value ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: value?.id,
        user_ids: userIds,
        role_id: roleId,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(body.error || "Save failed");
    toast.success(
      value ? "Support assistant updated" : "Support assistant created",
    );
    saved(Array.isArray(body) ? body : [body]);
  }
  return (
    <div className="fixed inset-0 z-[260] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">
            {value ? "Edit" : "Create"} Support Assistant
          </h2>
          <button type="button" onClick={close}>
            <X className="size-4" />
          </button>
        </div>
        <div className="relative mt-5">
          <label className="text-sm font-semibold">Staff</label>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="field mt-2 flex items-center justify-between text-left"
          >
            <span className="min-w-0 flex-1">
              {selectedUsers.length
                ? `${selectedUsers.length} staff selected`
                : "Select staff"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          </button>
          {open && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white p-2 shadow-xl">
              <label className="flex items-center gap-2 rounded-lg border px-3">
                <Search className="size-4 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-10 flex-1 outline-none"
                  placeholder="Search staff or super admin..."
                />
              </label>
              <div className="mt-2 max-h-56 overflow-y-auto">
                {visible.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUser(user.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0 flex-1">
                      <UserCell user={user} />
                    </span>
                    {userIds.includes(user.id) && (
                      <Check className="size-4 shrink-0 text-red" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {selectedUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleUser(user.id)}
                className="inline-flex max-w-full items-center gap-2 rounded-full border bg-slate-50 px-3 py-1.5 text-xs font-bold text-navy"
              >
                <span className="truncate">{user.full_name}</span>
                <X className="size-3" />
              </button>
            ))}
          </div>
        )}
        <label className="mt-5 block text-sm font-semibold">
          <span className="flex items-center justify-between gap-3">
            Role
            <button
              type="button"
              onClick={onCreateRole}
              className="inline-flex items-center gap-1 text-xs font-bold text-red"
            >
              <PlusCircle className="size-3.5" />
              Create Role
            </button>
          </span>
          <select
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            className="field mt-2 border-slate-200 bg-slate-50 font-semibold text-navy focus:border-red focus:bg-white"
            required
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button disabled={busy} className="btn-primary">
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RoleModal({
  value,
  close,
  saved,
}: {
  value: Role | null;
  close: () => void;
  saved: (row: Role) => void;
}) {
  const [name, setName] = useState(value?.name || ""),
    [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Enter a role");
    setBusy(true);
    const res = await fetch("/api/admin/support-assistants", {
      method: value ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "role", id: value?.id, name }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(body.error || "Save failed");
    toast.success(value ? "Role updated" : "Role created");
    saved(body);
  }
  return (
    <div className="fixed inset-0 z-[265] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">
            {value ? "Edit" : "Create"} Role
          </h2>
          <button type="button" onClick={close}>
            <X className="size-4" />
          </button>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          Role
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field mt-2"
            required
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button disabled={busy} className="btn-primary gap-2">
            <PlusCircle className="size-4" />
            {busy ? "Saving..." : value ? "Save Role" : "Create Role"}
          </button>
        </div>
      </form>
    </div>
  );
}
