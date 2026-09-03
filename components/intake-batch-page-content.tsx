import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  IntakeBatchManagement,
  type BatchRow,
  type IntakeRow,
} from "./intake-batch-management";
import { BatchForm, IntakeForm } from "./intake-batch-forms";

export async function IntakeListContent({ basePath }: { basePath: string }) {
  const { data } = await createAdminClient()
    .from("intakes")
    .select("*,course:courses(title)")
    .order("created_at", { ascending: false });
  return (
    <IntakeBatchManagement
      kind="intakes"
      initialRows={(data || []) as IntakeRow[]}
      basePath={basePath}
    />
  );
}
export async function IntakeFormContent({
  basePath,
  id,
}: {
  basePath: string;
  id?: string;
}) {
  const admin = createAdminClient();
  const [{ data }, { data: courses }] = await Promise.all([
    id
      ? admin.from("intakes").select("*").eq("id", id).maybeSingle()
      : Promise.resolve({ data: undefined }),
    admin.from("courses").select("id,title").order("title"),
  ]);
  if (id && !data) notFound();
  return (
    <IntakeForm
      basePath={basePath}
      initial={data || undefined}
      courses={(courses || []).map((course) => ({
        id: course.id,
        label: course.title,
      }))}
    />
  );
}
export async function IntakeViewContent({
  basePath,
  id,
}: {
  basePath: string;
  id: string;
}) {
  const { data } = await createAdminClient()
    .from("intakes")
    .select("*,course:courses(title)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return (
    <Details
      title={data.name}
      back={basePath}
      items={[
        ["Ref No", data.ref_no],
        ["Course", data.course?.title || "—"],
        ["Type", data.type],
        ["Year", data.year],
        ["Status", data.status],
        ["Created", new Date(data.created_at).toLocaleString()],
        ["Description", data.description || "—"],
      ]}
    />
  );
}
export async function BatchListContent({ basePath }: { basePath: string }) {
  const { data } = await createAdminClient()
    .from("batches")
    .select(
      "id,ref_no,batch_name,start_date,end_date,status,course:courses(title),intake:intakes(name,ref_no),batch_learners(count)",
    )
    .order("created_at", { ascending: false });
  const rows: BatchRow[] = (data || []).map((x: any) => ({
    id: x.id,
    ref_no: x.ref_no,
    batch_name: x.batch_name,
    course: x.course?.title || "—",
    intake: x.intake ? `${x.intake.name} (${x.intake.ref_no})` : "—",
    start_date: x.start_date,
    end_date: x.end_date,
    status: x.status,
    learners: x.batch_learners?.[0]?.count || 0,
  }));
  return (
    <IntakeBatchManagement
      kind="batches"
      initialRows={rows}
      basePath={basePath}
    />
  );
}
export async function BatchFormContent({
  basePath,
  id,
}: {
  basePath: string;
  id?: string;
}) {
  const admin = createAdminClient();
  const [{ data: courses }, { data: intakes }, { data: batch }] =
    await Promise.all([
      admin.from("courses").select("id,title").order("title"),
      admin.from("intakes").select("id,name,ref_no,course_id").order("name"),
      id
        ? admin.from("batches").select("*").eq("id", id).maybeSingle()
        : Promise.resolve({ data: undefined }),
    ]);
  if (id && !batch) notFound();
  return (
    <BatchForm
      basePath={basePath}
      initial={batch || undefined}
      courses={(courses || []).map((x) => ({ id: x.id, label: x.title }))}
      intakes={(intakes || []).map((x) => ({
        id: x.id,
        label: `${x.name} (${x.ref_no})`,
        courseId: x.course_id,
      }))}
    />
  );
}
export async function BatchViewContent({
  basePath,
  id,
}: {
  basePath: string;
  id: string;
}) {
  const { data } = await createAdminClient()
    .from("batches")
    .select(
      "*,course:courses(title),intake:intakes(name,ref_no),batch_learners(count)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return (
    <Details
      title={data.batch_name}
      back={basePath}
      items={[
        ["Ref No", data.ref_no],
        ["Course", data.course?.title || "—"],
        ["Intake", data.intake?.name || "—"],
        ["Start Date", data.start_date],
        ["End Date", data.end_date],
        ["Duration", `${data.duration_value} ${data.duration_unit}`],
        ["Status", data.status],
        ["Learners", data.batch_learners?.[0]?.count || 0],
      ]}
    />
  );
}
function Details({
  title,
  back,
  items,
}: {
  title: string;
  back: string;
  items: [string, unknown][];
}) {
  return (
    <>
      <a href={back} className="text-sm font-bold text-red">
        ← Back
      </a>
      <h1 className="mt-3 text-2xl font-bold text-navy">{title}</h1>
      <section className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className={label === "Description" ? "sm:col-span-2" : ""}
          >
            <p className="text-xs font-bold uppercase text-slate-400">
              {label}
            </p>
            <p className="mt-1 capitalize text-navy">{String(value)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
