"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Search, Upload, UserCog } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
import { useIsStaffPortal } from "./staff-permission-context";

type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};
type SupportRole = { id: string; name: string };
export function SupportTicketForm({
  students = [],
  roles = [],
  assignByRole = false,
}: {
  students?: Student[];
  roles?: SupportRole[];
  assignByRole?: boolean;
}) {
  const basePath = useIsStaffPortal()
    ? "/dashboard/admin-staff/support/tickets"
    : "/dashboard/super-admin/support/tickets";
  const [selected, setSelected] = useState(""),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [description, setDescription] = useState(""),
    [file, setFile] = useState(""),
    [busy, setBusy] = useState(false),
    router = useRouter(),
    visible = useMemo(
      () =>
        students.filter((student) =>
          `${student.name} ${student.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [students, query],
    ),
    visibleRoles = useMemo(
      () =>
        roles.filter((role) =>
          role.name.toLowerCase().includes(query.toLowerCase()),
        ),
      [roles, query],
    ),
    student = students.find((item) => item.id === selected),
    role = roles.find((item) => item.id === selected);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected)
      return toast.error(assignByRole ? "Select a role" : "Select a student");
    if (description.replace(/<[^>]*>/g, "").trim().length < 2)
      return toast.error("Enter a ticket description");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    form.set(assignByRole ? "role_id" : "student_id", selected);
    form.set("description", description);
    const res = await fetch("/api/admin/support-tickets", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      toast.success("Ticket created");
      router.push(basePath);
      router.refresh();
    } else {
      toast.error(
        (await res.json().catch(() => ({}))).error || "Ticket creation failed",
      );
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
        Back to Tickets
      </button>
      <p className="text-sm text-slate-400">Support / Tickets / Create</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Add New Ticket</h1>
      <form
        onSubmit={submit}
        className="mt-7 space-y-6 rounded-xl border bg-white p-4 sm:p-7"
      >
        <section>
          <h2 className="text-lg font-bold text-navy">Ticket Information</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="relative md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                {assignByRole ? "Role" : "Student"}
              </label>
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`field flex items-center justify-between text-left font-semibold text-navy shadow-sm transition focus:border-red focus:bg-white ${
                  assignByRole
                    ? "min-h-14 border-2 border-red/40 bg-red/10 ring-4 ring-red/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {assignByRole && role ? (
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red text-white">
                      <UserCog className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm text-navy">
                        {role.name}
                      </b>
                      <small className="block truncate text-slate-400">
                        Support role
                      </small>
                    </span>
                  </span>
                ) : student ? (
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar student={student} />
                    <span className="min-w-0">
                      <b className="block truncate text-sm text-navy">
                        {student.name}
                      </b>
                      <small className="block truncate text-slate-400">
                        {student.email}
                      </small>
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {assignByRole ? "Select role" : "Select student"}
                  </span>
                )}
                <ChevronDown className="size-4 shrink-0 text-red" />
              </button>
              {open && (
                <div
                  className={`absolute z-50 mt-2 w-full rounded-xl border p-2 shadow-xl ${
                    assignByRole
                      ? "border-2 border-red/30 bg-white shadow-2xl ring-4 ring-red/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                    <Search className="size-4 text-slate-400" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={
                        assignByRole
                          ? "Search support role..."
                          : "Search student name or email..."
                      }
                      className="h-11 w-full outline-none"
                    />
                  </label>
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {(assignByRole ? visibleRoles : visible).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelected(item.id);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-red/5"
                      >
                        {assignByRole ? (
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red text-white">
                            <UserCog className="size-4" />
                          </span>
                        ) : (
                          <Avatar student={item as Student} />
                        )}
                        <span className="min-w-0">
                          <b className="block truncate text-sm text-navy">
                            {item.name}
                          </b>
                          {"email" in item && (
                            <small className="block truncate text-slate-400">
                              {(item as Student).email}
                            </small>
                          )}
                        </span>
                      </button>
                    ))}
                    {!(assignByRole ? visibleRoles : visible).length && (
                      <p className="p-4 text-center text-sm text-slate-400">
                        {assignByRole
                          ? "No roles found."
                          : "No students found."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Field label="Subject" name="subject" />
            <Select
              label="Priority"
              name="priority"
              values={[
                ["low", "Low"],
                ["medium", "Medium"],
                ["high", "High"],
              ]}
            />
            <Select
              label="Status"
              name="status"
              values={[
                ["open", "Open"],
                ["pending", "Pending"],
                ["answered", "Answered"],
                ["on_hold", "On Hold"],
                ["closed", "Closed"],
              ]}
            />
          </div>
        </section>
        <section>
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>
          <CourseEditor value={description} onChange={setDescription} />
        </section>
        <section>
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-4 text-center">
            <Upload className="mb-2 size-7 text-red" />
            <b className="text-sm text-navy">Upload Attachment</b>
            <span className="mt-1 text-xs text-slate-400">
              Click to upload a supporting file
            </span>
            <input
              type="file"
              name="attachment"
              className="mt-3 max-w-full text-xs"
              onChange={(event) => setFile(event.target.files?.[0]?.name || "")}
            />
            {file && (
              <span className="mt-2 text-xs font-semibold text-emerald-600">
                {file}
              </span>
            )}
          </label>
        </section>
        <div className="flex flex-col-reverse gap-3 min-[380px]:flex-row min-[380px]:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button disabled={busy} className="btn-primary">
            {busy ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </>
  );
}

function Avatar({ student }: { student: Student }) {
  return student.avatar ? (
    <img
      src={student.avatar}
      alt=""
      className="size-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-bold text-white">
      {student.name[0]}
    </span>
  );
}
function Field({ label, name }: { label: string; name: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input name={name} className="field mt-2" required />
    </label>
  );
}
function Select({
  label,
  name,
  values,
}: {
  label: string;
  name: string;
  values: string[][];
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="relative mt-2 block">
        <select
          name={name}
          className="field appearance-none border-slate-200 bg-slate-50 pr-10 font-semibold capitalize text-navy shadow-sm transition focus:border-red focus:bg-white"
          required
        >
          {values.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-red" />
      </span>
    </label>
  );
}
