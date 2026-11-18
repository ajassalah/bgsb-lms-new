import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CircleDot,
  Clock3,
  Hash,
  Layers,
  Pencil,
  Tag,
  Users,
} from "lucide-react";
import {
  DetailList,
  DetailPage,
  DetailSection,
  Lozenge,
  formatDate,
} from "@/components/portal/object-detail";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  IntakeBatchManagement,
  type BatchRow,
  type IntakeRow,
} from "./intake-batch-management";
import { BatchForm, IntakeForm } from "./intake-batch-forms";
import { BatchLearnersPanel } from "./batch-learners-panel";

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
    <DetailPage
      title={data.name}
      icon={CalendarRange}
      status={data.status}
      meta={<span>Intake · {data.ref_no}</span>}
      back={{ href: basePath, label: "Back to intakes" }}
      actions={editAction(basePath, id)}
      aside={
        <DetailSection title="Details">
          <DetailList
            compact
            items={[
              { label: "Status", value: <Lozenge value={data.status} />, icon: CircleDot },
              { label: "Created", value: formatDate(data.created_at, true), icon: Clock3 },
            ]}
          />
        </DetailSection>
      }
    >
      <DetailSection title="Overview">
        <DetailList
          items={[
            { label: "Reference no", value: data.ref_no, icon: Hash },
            { label: "Course", value: data.course?.title, icon: BookOpen },
            { label: "Type", value: <span className="capitalize">{data.type}</span>, icon: Tag },
            { label: "Year", value: data.year, icon: CalendarDays },
          ]}
        />
      </DetailSection>
      <DetailSection title="Description">
        {data.description ? (
          <p className="whitespace-pre-line text-sm leading-6 text-[#172B4D]">
            {data.description}
          </p>
        ) : (
          <p className="text-sm text-[#6B778C]">No description added.</p>
        )}
      </DetailSection>
    </DetailPage>
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
  const admin = createAdminClient();
  const [{ data }, { data: configuration }] = await Promise.all([
    admin
      .from("batches")
      .select(
        "*,course:courses(title),intake:intakes(name,ref_no),batch_learners(student_id,student:profiles!batch_learners_student_id_fkey(id,full_name,email))",
      )
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("email_configuration")
      .select("from_email")
      .eq("id", 1)
      .maybeSingle(),
  ]);
  if (!data) notFound();
  const learnerRows = (data.batch_learners || [])
    .map((item: any) => {
      const learner = Array.isArray(item.student) ? item.student[0] : item.student;
      return learner
        ? {
            id: learner.id,
            learnerNo: learner.id.slice(0, 8).toUpperCase(),
            name: learner.full_name || "Learner",
            email: learner.email || "No email",
          }
        : null;
    })
    .filter(Boolean);
  const learners = learnerRows.length;
  return (
    <DetailPage
      title={data.batch_name}
      icon={Layers}
      status={data.status}
      meta={<span>Batch · {data.ref_no}</span>}
      back={{ href: basePath, label: "Back to batches" }}
      actions={editAction(basePath, id)}
      aside={
        <>
          <DetailSection title="Learners">
            <p className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-[3px] bg-[#E3FCEF] text-[#006644]">
                <Users className="size-5" />
              </span>
              <span>
                <b className="block text-2xl font-semibold leading-7 text-[#172B4D]">
                  {learners}
                </b>
                <span className="text-xs text-[#6B778C]">
                  {learners === 1 ? "learner enrolled" : "learners enrolled"}
                </span>
              </span>
            </p>
          </DetailSection>
          <DetailSection title="Details">
            <DetailList
              compact
              items={[
                { label: "Status", value: <Lozenge value={data.status} />, icon: CircleDot },
                {
                  label: "Duration",
                  value: data.duration_value
                    ? `${data.duration_value} ${data.duration_unit || ""}`
                    : null,
                  icon: Clock3,
                },
              ]}
            />
          </DetailSection>
        </>
      }
    >
      <DetailSection title="Overview">
        <DetailList
          items={[
            { label: "Reference no", value: data.ref_no, icon: Hash },
            { label: "Course", value: data.course?.title, icon: BookOpen },
            {
              label: "Intake",
              value: data.intake
                ? `${data.intake.name}${data.intake.ref_no ? ` (${data.intake.ref_no})` : ""}`
                : null,
              icon: CalendarRange,
            },
          ]}
        />
      </DetailSection>
      <DetailSection title="Schedule">
        <DetailList
          items={[
            { label: "Start date", value: formatDate(data.start_date), icon: CalendarDays },
            { label: "End date", value: formatDate(data.end_date), icon: CalendarCheck },
          ]}
        />
      </DetailSection>
      <DetailSection title="Learner communication">
        <p className="mb-4 text-sm text-[#6B778C]">
          View the learners enrolled in this batch or send a message to selected learners.
        </p>
        <BatchLearnersPanel
          batchId={id}
          batchName={data.batch_name}
          learners={learnerRows}
          fromEmail={configuration?.from_email || "Not configured"}
          basePath={basePath}
        />
      </DetailSection>
    </DetailPage>
  );
}

/** Edit is only linked where the route is open to the viewer (super admin). */
function editAction(basePath: string, id: string) {
  if (!basePath.includes("/super-admin/")) return null;
  return (
    <Link href={`${basePath}/${id}/edit`} className="btn-secondary">
      <Pencil className="size-4" /> Edit
    </Link>
  );
}
