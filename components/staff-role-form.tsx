"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PermissionMatrix, type PermissionSet } from "./permission-matrix";
import { RoleCombobox } from "./role-combobox";
export function StaffRoleForm({
  value,
}: {
  value?: { id: string; name: string; permissions: PermissionSet };
}) {
  const [name, setName] = useState(value?.name || ""),
    [permissions, setPermissions] = useState<PermissionSet>(
      value?.permissions || {},
    ),
    [roles, setRoles] = useState<
      { name: string; permissions: PermissionSet }[]
    >([]),
    [customRole, setCustomRole] = useState(false),
    [busy, setBusy] = useState(false),
    router = useRouter();
  useEffect(() => {
    fetch("/api/admin/staff-roles")
      .then((response) => response.json())
      .then((body) => setRoles(body.items || []))
      .catch(() => {});
  }, []);
  function selectRole(role: string) {
    setCustomRole(false);
    setName(role);
    const preset = roles.find((item) => item.name === role);
    if (preset) setPermissions(preset.permissions || {});
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(
      value ? `/api/admin/staff-roles/${value.id}` : "/api/admin/staff-roles",
      {
        method: value ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, permissions }),
      },
    );
    if (res.ok) {
      toast.success(value ? "Role updated" : "Role permissions saved");
      router.push("/dashboard/super-admin/roles");
      router.refresh();
    } else {
      toast.error((await res.json()).error || "Save failed");
      setBusy(false);
    }
  }
  return (
    <>
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="size-4" />
        Back to Roles
      </button>
      <h1 className="text-2xl font-bold text-navy">
        {value ? "Edit" : "Add"} Role
      </h1>
      <form onSubmit={submit} className="mt-7 space-y-6">
        <section className="rounded-xl border bg-white p-4 sm:p-6">
          <label className="block max-w-md text-sm font-semibold">
            Role Name
            {customRole ? (
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field mt-2"
                placeholder="Enter new role name"
                required
              />
            ) : (
              <RoleCombobox
                value={name}
                onChange={selectRole}
                options={
                  roles.length ? roles.map((role) => role.name) : undefined
                }
                onAddNew={() => {
                  setCustomRole(true);
                  setName("");
                  setPermissions({});
                }}
              />
            )}
            {customRole && (
              <button
                type="button"
                onClick={() => {
                  setCustomRole(false);
                  setName("");
                  setPermissions({});
                }}
                className="mt-3 text-xs font-bold text-red"
              >
                Select Existing Role
              </button>
            )}
          </label>
        </section>
        <section className="rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-navy">Permissions</h2>
          <PermissionMatrix value={permissions} onChange={setPermissions} />
        </section>
        <div className="flex justify-end">
          <button disabled={busy} className="btn-primary gap-2">
            <Save className="size-4" />
            {busy ? "Saving…" : "Save Role"}
          </button>
        </div>
      </form>
    </>
  );
}
