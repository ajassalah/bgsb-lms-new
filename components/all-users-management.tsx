"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useIsStaffPortal, useStaffCan } from "./staff-permission-context";
import { TablePagination } from "./table-pagination";

export type SystemUser = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  staff_role: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
  ip_address: string | null;
  created_by_name: string | null;
  verified_by_name: string | null;
};
export function AllUsersManagement({
  initialRows,
}: {
  initialRows: SystemUser[];
}) {
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [role, setRole] = useState("all"),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [passwordUser, setPasswordUser] = useState<SystemUser | null>(null),
    [password, setPassword] = useState(""),
    [showPassword, setShowPassword] = useState(false);
  const staff = useIsStaffPortal(),
    canView = useStaffCan("all_users", "view"),
    canPassword = useStaffCan("all_users", "manage_password"),
    canReset = useStaffCan("all_users", "send_reset_link"),
    canStatus = useStaffCan("all_users", "status");
  const filtered = useMemo(
    () =>
      rows.filter(
        (x) =>
          (role === "all" || x.role === role) &&
          `${x.full_name} ${x.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [rows, query, role],
  );
  const active = rows.filter((x) => x.status === "active").length,
    suspended = rows.filter((x) => x.status === "suspended").length,
    pages = Math.max(1, Math.ceil(filtered.length / 20)),
    visible = filtered.slice((page - 1) * 20, page * 20);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("[data-user-action]"))
        setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  function generatePassword() {
    const groups = [
        "ABCDEFGHJKLMNPQRSTUVWXYZ",
        "abcdefghijkmnopqrstuvwxyz",
        "23456789",
        "!@#$%&*_-+",
      ],
      all = groups.join(""),
      random = (characters: string) => {
        const values = new Uint32Array(1);
        crypto.getRandomValues(values);
        return characters[values[0] % characters.length];
      },
      result = groups.map(random);
    while (result.length < 18) result.push(random(all));
    for (let index = result.length - 1; index > 0; index--) {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      const swap = values[0] % (index + 1);
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    setPassword(result.join(""));
    setShowPassword(true);
  }
  async function action(user: SystemUser, type: string, value?: string) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: type, value }),
      }),
      body = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(body.error || "Action failed");
    if (type === "status")
      setRows((x) =>
        x.map((r) => (r.id === user.id ? { ...r, status: value! } : r)),
      );
    setMenu(null);
    toast.success(body.message || "User updated");
  }
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">System Settings</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">All Users</h1>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Stat label="Active Users" value={active} tone="emerald" />
        <Stat label="Suspended Users" value={suspended} tone="red" />
      </div>
      <section className="mt-6 overflow-visible rounded-2xl border bg-white">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <label className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field pl-10"
              placeholder="Search name or email..."
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="field min-w-48 pl-10"
            >
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin_staff">Staff</option>
            </select>
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="min-w-[1250px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">User Details</th>
                <th>IP Address</th>
                <th>User Role</th>
                <th>Account Status</th>
                <th>Registered Date</th>
                <th>Last Login</th>
                <th>Created By</th>
                <th>Verified By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((u) => (
                <tr key={u.id}>
                  <td className="p-4">
                    <div className="flex gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">
                          {u.full_name[0]}
                        </span>
                      )}
                      <span>
                        <b className="block text-navy">{u.full_name}</b>
                        <small>{u.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>{u.ip_address || "—"}</td>
                  <td className="capitalize">
                    {u.role === "admin_staff"
                      ? u.staff_role || "Staff"
                      : u.role.replaceAll("_", " ")}
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString("en-GB")}</td>
                  <td>
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleString("en-GB")
                      : "Never"}
                  </td>
                  <td>{u.created_by_name || "System"}</td>
                  <td>{u.verified_by_name || "—"}</td>
                  <td className="relative p-4" data-user-action>
                    <button
                      onClick={() => setMenu(menu === u.id ? null : u.id)}
                      className="ml-auto grid size-9 place-items-center rounded-lg border bg-white text-slate-500 transition hover:bg-slate-50 hover:text-navy"
                      aria-label="User actions"
                    >
                      <MoreHorizontal className="size-5" />
                    </button>
                    {menu === u.id && (
                      <div className="absolute right-4 top-14 z-[300] w-60 rounded-xl border bg-white py-1 text-left shadow-2xl">
                        {canView && (
                          <a
                            href={`/dashboard/${staff ? "admin-staff" : "super-admin"}/${u.role === "student" ? "students" : "instructors"}/${u.id}`}
                            className="row-action"
                          >
                            <Eye />
                            View Profile
                          </a>
                        )}
                        {canPassword && (
                          <button
                            onClick={() => {
                              setPasswordUser(u);
                              setMenu(null);
                            }}
                            className="row-action"
                          >
                            <KeyRound />
                            Manage Password
                          </button>
                        )}
                        {canReset && (
                          <button
                            onClick={() => action(u, "reset")}
                            className="row-action"
                          >
                            <Mail />
                            Send Password Reset Link
                          </button>
                        )}
                        {canStatus && (
                          <>
                            {u.status !== "active" && (
                              <button
                                onClick={() => action(u, "status", "active")}
                                className="row-action"
                              >
                                <ShieldCheck />
                                Make Active
                              </button>
                            )}
                            {u.status !== "suspended" && (
                              <button
                                onClick={() => action(u, "status", "suspended")}
                                className="row-action text-red"
                              >
                                <ShieldCheck />
                                Suspend
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} total={pages} onChange={setPage} />
      </section>
      {passwordUser && (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-black/55 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action(passwordUser, "password", password).then(() => {
                setPasswordUser(null);
                setPassword("");
              });
            }}
            className="w-full max-w-sm rounded-2xl bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-navy">Manage Password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {passwordUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasswordUser(null);
                  setPassword("");
                  setShowPassword(false);
                }}
                className="grid size-9 place-items-center rounded-lg border"
              >
                <X className="size-4" />
              </button>
            </div>
            <label className="mt-5 block text-sm font-bold text-navy">
              New Password
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-slate-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </span>
            </label>
            <button
              type="button"
              onClick={generatePassword}
              className="btn-secondary mt-3 w-full gap-2"
            >
              <WandSparkles className="size-4" />
              Generate Strong Password
            </button>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPasswordUser(null);
                  setPassword("");
                  setShowPassword(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button className="btn-primary">Update Password</button>
            </div>
          </form>
        </div>
      )}
      <style jsx global>{`
        .row-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          text-align: left;
        }
        .row-action:hover {
          background: #f8fafc;
        }
        .row-action svg {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}
function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
      <span
        className={`grid size-12 place-items-center rounded-xl ${tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red"}`}
      >
        <Users />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <b className="text-2xl text-navy">{value}</b>
      </div>
    </div>
  );
}
