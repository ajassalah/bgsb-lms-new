"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Save,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
import { CourseMediaFields } from "./course-media-fields";
import { InstructorPicker } from "./instructor-picker";
type Option = { id: string; name: string };
type Course = {
  id: string;
  title: string;
  category_id: string | null;
  status: string;
  short_description: string | null;
  description: string | null;
  course_type: string;
  language: string;
  instructor_id: string | null;
  instructor_ids?: string[];
  duration_weeks: number | null;
  tags: string[] | null;
  video_source: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
};
export function CourseEditForm({
  course,
  categories,
  instructors,
}: {
  course: Course;
  categories: Option[];
  instructors: Option[];
}) {
  const [step, setStep] = useState(1),
    [busy, setBusy] = useState(false),
    [basic, setBasic] = useState<Record<string, string>>({}),
    [description, setDescription] = useState(course.description || ""),
    [videoSource, setVideoSource] = useState(course.video_source || "youtube"),
    [selectedInstructors, setSelectedInstructors] = useState<string[]>(
      course.instructor_ids ||
        (course.instructor_id ? [course.instructor_id] : []),
    ),
    router = useRouter();
  function next(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBasic(
      Object.fromEntries(new FormData(e.currentTarget)) as Record<
        string,
        string
      >,
    );
    setStep(2);
    scrollTo({ top: 0, behavior: "smooth" });
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const payload = new FormData();
    Object.entries(basic).forEach(([k, v]) => payload.set(k, v));
    payload.set("description", description);
    payload.set("video_source", videoSource);
    payload.set("instructor_ids", JSON.stringify(selectedInstructors));
    const media = new FormData(e.currentTarget);
    for (const key of ["thumbnail", "video"]) {
      const f = media.get(key);
      if (f instanceof File && f.size) payload.set(key, f);
    }
    payload.set(
      "video_link",
      String(media.get("video_link") || course.video_url || ""),
    );
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      body: payload,
    });
    if (res.ok) {
      toast.success("Course updated");
      router.push("/dashboard/super-admin/courses");
      router.refresh();
    } else {
      toast.error(
        (await res.json().catch(() => ({}))).error || "Update failed",
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
        Back to Course List
      </button>
      <div className="mb-7">
        <p className="text-sm text-slate-400">Courses / Edit Course</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Edit Course</h1>
      </div>
      <div className="mb-7 overflow-hidden rounded-xl border bg-white p-3 sm:p-5">
        <div className="mx-auto flex max-w-2xl justify-between">
          <Step active n={1} label="Basic Information" done={step === 2} />
          <Step active={step === 2} n={2} label="Media & Images" />
        </div>
      </div>
      {step === 1 ? (
        <form onSubmit={next} className="rounded-xl border bg-white p-4 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Course Title"
              name="title"
              defaultValue={course.title}
            />
            <Select
              label="Select Category"
              name="category_id"
              value={course.category_id || ""}
              options={categories}
            />
            <Select
              label="Course Type"
              name="course_type"
              value={course.course_type}
              values={["online", "onsite", "hybrid"]}
            />
            <Select
              label="Language"
              name="language"
              value={course.language}
              values={["English", "Sinhala", "Tamil"]}
            />
            <InstructorPicker
              instructors={instructors}
              selected={selectedInstructors}
              onChange={setSelectedInstructors}
            />
            <Field
              label="Course Duration"
              name="duration_weeks"
              type="number"
              min="1"
              placeholder="Duration in Month"
              defaultValue={course.duration_weeks || 1}
            />
            <Field
              label="Course Tag"
              name="tags"
              defaultValue={(course.tags || []).join(", ")}
            />
            <Select
              label="Status"
              name="status"
              value={course.status}
              values={["draft", "published", "archived"]}
            />
          </div>
          <label className="mt-5 block text-sm font-semibold">
            Short Description
            <textarea
              name="short_description"
              defaultValue={course.short_description || ""}
              className="field mt-2 min-h-24"
              required
            />
          </label>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>
            <CourseEditor value={description} onChange={setDescription} />
          </div>
          <div className="mt-7 flex justify-end">
            <button className="btn-primary gap-2">
              Next: Media & Images
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submit} className="rounded-xl border bg-white p-6">
          <CourseMediaFields
            basic={basic}
            videoSource={videoSource}
            setVideoSource={setVideoSource}
            existingThumbnail={course.thumbnail_url}
            existingVideo={course.video_url}
          />
          <div className="mt-7 flex flex-col-reverse gap-3 min-[380px]:flex-row min-[380px]:justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button disabled={busy} className="btn-primary gap-2">
              <Save className="size-4" />
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
function Step({
  active,
  n,
  label,
  done = false,
}: {
  active: boolean;
  n: number;
  label: string;
  done?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`grid size-10 place-items-center rounded-full font-bold ${active ? "bg-red text-white" : "bg-slate-100 text-slate-400"}`}
      >
        {done ? <Check /> : n}
      </span>
      <b className="text-sm">
        {n} - {label}
      </b>
    </div>
  );
}
function Field({ label, ...p }: { label: string; [key: string]: any }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input {...p} className="field mt-2" required={p.name !== "tags"} />
    </label>
  );
}
function Select({
  label,
  name,
  value,
  options,
  values,
  optional,
}: {
  label: string;
  name: string;
  value: string;
  options?: Option[];
  values?: string[];
  optional?: boolean;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="field mt-2"
        required={!optional}
      >
        <option value="">{optional ? "None" : "Choose an option"}</option>
        {options?.map((x) => (
          <option value={x.id} key={x.id}>
            {x.name}
          </option>
        ))}
        {values?.map((x) => (
          <option value={x} key={x}>
            {x[0].toUpperCase() + x.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
function UploadBox({
  name,
  icon: Icon,
  accept,
  label,
}: {
  name: string;
  icon: typeof Upload;
  accept: string;
  label: string;
}) {
  return (
    <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50">
      <Icon className="mb-2 text-red" />
      <b>{label}</b>
      <input name={name} type="file" accept={accept} className="mt-3 text-xs" />
    </label>
  );
}
