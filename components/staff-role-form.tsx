"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PermissionMatrix, type PermissionSet } from "./permission-matrix";
export function StaffRoleForm({
  value,
}: {
  value?: { id: string; name: string; permissions: PermissionSet };
}) {
  const [name, setName] = useState(value?.name || ""),
    [permissions, setPermissions] = useState<PermissionSet>(
      value?.permissions || {},
    ),
    [busy, setBusy] = useState(false),
    router = useRouter();
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
      toast.success(value ? "Role updated" : "Role created");
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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field mt-2"
              required
            />
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
