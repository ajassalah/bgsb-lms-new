"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

type Intake = {
  id?: string;
  course_id: string;
  name: string;
  description?: string | null;
  type: string;
  year: number;
  status: string;
};
type Batch = {
  id?: string;
  course_id: string;
  intake_id: string;
  batch_name: string;
  start_date: string;
  duration_value: number;
  duration_unit: string;
  status: string;
};
type Option = { id: string; label: string; courseId?: string };

export function IntakeForm({
  initial,
  basePath,
  courses,
}: {
  initial?: Intake;
  basePath: string;
  courses: Option[];
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch(
      initial?.id ? `/api/admin/intakes/${initial.id}` : "/api/admin/intakes",
      {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "Could not save intake");
    toast.success(initial?.id ? "Intake updated" : "Intake created");
    router.push(basePath);
    router.refresh();
  }
  return (
    <FormCard
      title={initial ? "Edit Intake" : "Create Intake"}
      back={basePath}
      onSubmit={submit}
      busy={busy}
    >
      <Field label="Course">
        <select
          className="field"
          name="course_id"
          required
          defaultValue={initial?.course_id || ""}
        >
          <option value="" disabled>
            Select course
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Name">
        <input
          className="field"
          name="name"
          required
          defaultValue={initial?.name}
        />
      </Field>
      <Field label="Description" wide>
        <textarea
          className="field min-h-28"
          name="description"
          defaultValue={initial?.description || ""}
        />
      </Field>
      <Field label="Type">
        <select
          className="field"
          name="type"
          defaultValue={initial?.type || "regular"}
        >
          <option value="regular">Regular</option>
          <option value="late">Late</option>
          <option value="early">Early</option>
        </select>
      </Field>
      <Field label="Year">
        <input
          className="field"
          name="year"
          type="number"
          min="2000"
          max="2200"
          required
          defaultValue={initial?.year || new Date().getFullYear()}
        />
      </Field>
      <Field label="Status">
        <StatusSelect value={initial?.status} />
      </Field>
    </FormCard>
  );
}

export function BatchForm({
  initial,
  courses,
  intakes,
  basePath,
}: {
  initial?: Batch;
  courses: Option[];
  intakes: Option[];
  basePath: string;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [courseId, setCourseId] = useState(initial?.course_id || ""),
    [intakeId, setIntakeId] = useState(initial?.intake_id || "");
  const availableIntakes = intakes.filter(
    (intake) => intake.courseId === courseId,
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const body = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const res = await fetch(
      initial?.id ? `/api/admin/batches/${initial.id}` : "/api/admin/batches",
      {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "Could not save batch");
    toast.success(initial?.id ? "Batch updated" : "Batch created");
    router.push(basePath);
    router.refresh();
  }
  return (
    <FormCard
      title={initial ? "Edit Batch" : "Create Batch"}
      back={basePath}
      onSubmit={submit}
      busy={busy}
    >
      <Field label="Course">
        <select
          className="field"
          name="course_id"
          required
          value={courseId}
          onChange={(event) => {
            setCourseId(event.target.value);
            setIntakeId("");
          }}
        >
          <option value="" disabled>
            Select course
          </option>
          {courses.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Batch Name">
        <input
          className="field"
          name="batch_name"
          required
          defaultValue={initial?.batch_name}
        />
      </Field>
      <Field label="Intake">
        <select
          className="field"
          name="intake_id"
          required
          value={intakeId}
          onChange={(event) => setIntakeId(event.target.value)}
        >
          <option value="" disabled>
            Select intake
          </option>
          {availableIntakes.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Start Date">
        <input
          className="field"
          name="start_date"
          type="date"
          required
          defaultValue={initial?.start_date}
        />
      </Field>
      <Field label="Duration">
        <div className="grid grid-cols-2 gap-2">
          <input
            className="field"
            name="duration_value"
            type="number"
            min="1"
            required
            defaultValue={initial?.duration_value || 1}
          />
          <select
            className="field"
            name="duration_unit"
            defaultValue={initial?.duration_unit || "months"}
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Year</option>
          </select>
        </div>
      </Field>
      <Field label="Status">
        <StatusSelect value={initial?.status} />
      </Field>
    </FormCard>
  );
}

function StatusSelect({ value }: { value?: string }) {
  return (
    <select className="field" name="status" defaultValue={value || "draft"}>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="draft">Draft</option>
    </select>
  );
}
function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`block text-sm font-bold text-navy ${wide ? "md:col-span-2" : ""}`}
    >
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
function FormCard({
  title,
  back,
  onSubmit,
  busy,
  children,
}: {
  title: string;
  back: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href={back}
          className="grid size-10 place-items-center rounded-lg border bg-white"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border bg-white p-4 sm:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">{children}</div>
        <div className="mt-6 flex justify-end">
          <button disabled={busy} className="btn-primary gap-2">
            <Save className="size-4" />
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}
