"use client";
import { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Radio,
  Search,
  ShieldCheck,
} from "lucide-react";
type Student = {
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  about: string | null;
  nic_passport: string | null;
  avatar_url: string | null;
};
type Course = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  modules: number;
  assignments: number;
  quizzes: number;
};
type Certificate = {
  id: string;
  course: string;
  url: string | null;
  date: string;
};
type Payment = {
  id: string;
  title: string;
  method: string;
  date: string;
  amount: number;
};
type Login = {
  id: string;
  browser: string;
  platform: string;
  ip: string;
  date: string;
};
type LiveClass = {
  id: string;
  title: string;
  thumbnail: string | null;
  description: string;
  link: string | null;
  scheduled_start: string;
  scheduled_end: string;
};
export function StudentProfileView({
  student,
  courses,
  certificates,
  payments,
  logins,
  liveClasses,
  hidePayments = false,
}: {
  student: Student;
  courses: Course[];
  certificates: Certificate[];
  payments: Payment[];
  logins: Login[];
  liveClasses: LiveClass[];
  hidePayments?: boolean;
}) {
  const [tab, setTab] = useState<
    | "identification"
    | "courses"
    | "live"
    | "certificates"
    | "payments"
    | "logins"
  >("identification");
  const tabs = [
    ["identification", "Identification"],
    ["courses", "Enrolled Courses"],
    ["live", "Live Classes"],
    ["certificates", "Certificate"],
    ["payments", "Payment History"],
    ["logins", "Login History"],
  ].filter(
    ([key]) => !hidePayments || key !== "payments",
  ) as unknown as readonly (readonly [typeof tab, string])[];
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Manage Students / View</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Student Profile</h1>
      </div>
      <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border bg-white p-6 text-center">
          {student.avatar_url ? (
            <img
              src={student.avatar_url}
              alt=""
              className="mx-auto size-36 rounded-full object-cover ring-4 ring-slate-100"
            />
          ) : (
            <span className="mx-auto grid size-36 place-items-center rounded-full bg-navy text-4xl font-bold text-white">
              {student.full_name[0]}
            </span>
          )}
          <h2 className="mt-4 text-xl font-bold text-navy">
            {student.full_name}
          </h2>
          <p className="text-sm text-slate-400">{student.email}</p>
          <div className="mt-6 border-t pt-5 text-left">
            <h3 className="font-bold text-navy">Personal Information</h3>
            <Info label="Phone" value={student.phone} />
            <Info label="Country" value={student.country} />
            <Info label="Address" value={student.address} />
            <Info
              label="Date of Birth"
              value={
                student.date_of_birth
                  ? new Date(student.date_of_birth).toLocaleDateString("en-GB")
                  : null
              }
            />
            <Info label="Gender" value={student.gender?.replaceAll("_", " ")} />
            {student.about && <Info label="About" value={student.about} />}
          </div>
        </aside>
        <main className="min-w-0 max-w-full overflow-hidden rounded-2xl border bg-white">
          <div className="flex overflow-x-auto border-b p-2">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold ${tab === key ? "bg-red text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-6">
            {tab === "identification" && <Identification student={student} />}{" "}
            {tab === "courses" && <Courses rows={courses} />}{" "}
            {tab === "live" && <LiveClasses rows={liveClasses} />}{" "}
            {tab === "certificates" && <Certificates rows={certificates} />}{" "}
            {tab === "payments" && <PaymentTable rows={payments} />}{" "}
            {tab === "logins" && <LoginTable rows={logins} />}
          </div>
        </main>
      </div>
    </>
  );
}

function LiveClasses({ rows }: { rows: LiveClass[] }) {
  const now = Date.now(),
    groups = [
      [
        "Scheduled Classes",
        rows.filter((row) => new Date(row.scheduled_end).getTime() >= now),
      ],
      [
        "Expired Classes",
        rows.filter((row) => new Date(row.scheduled_end).getTime() < now),
      ],
    ] as const;
  return (
    <div className="space-y-8">
      {groups.map(([title, classes]) => (
        <section key={title} className="px-3 sm:px-0">
          <h3 className="rounded-xl bg-white px-5 py-4 font-bold text-navy">
            {title}
          </h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {classes.map((liveClass) => (
              <article
                key={liveClass.id}
                className="min-w-0 overflow-hidden rounded-xl border"
              >
                {liveClass.thumbnail ? (
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100">
                    <img
                      src={liveClass.thumbnail}
                      alt=""
                      className="block size-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="grid h-40 place-items-center bg-slate-100">
                    <Radio className="text-slate-300" />
                  </span>
                )}
                <div className="p-4">
                  <b className="text-navy">{liveClass.title}</b>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {new Date(liveClass.scheduled_start).toLocaleString(
                      "en-GB",
                    )}{" "}
                    –{" "}
                    {new Date(liveClass.scheduled_end).toLocaleString("en-GB")}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {liveClass.description}
                  </p>
                  {liveClass.link && (
                    <a
                      href={liveClass.link}
                      target="_blank"
                      className="mt-3 block text-sm font-semibold text-blue-600"
                    >
                      Open Live Class
                    </a>
                  )}
                </div>
              </article>
            ))}
            {!classes.length && (
              <p className="text-sm text-slate-400">
                No {title.toLowerCase()}.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="mt-4">
      <small className="block text-slate-400">{label}</small>
      <b className="block capitalize text-sm text-navy">{value || "—"}</b>
    </div>
  );
}
function Identification({ student }: { student: Student }) {
  return (
    <>
      <div className="grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
        <Info label="NIC/Passport No" value={student.nic_passport} />
        <Info label="Email Address" value={student.email} />
      </div>
    </>
  );
}
function Courses({ rows: courses }: { rows: Course[] }) {
  return (
    <>
      <h3 className="font-bold text-navy">Enrolled Courses</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {courses.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-xl border">
            <div className="flex gap-4 p-4">
              {c.thumbnail_url ? (
                <img
                  src={c.thumbnail_url}
                  alt=""
                  className="h-24 w-32 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-24 w-32 place-items-center rounded-lg bg-slate-100">
                  <BookOpen className="text-slate-300" />
                </span>
              )}
              <div className="min-w-0">
                <b className="line-clamp-2 text-navy">{c.title}</b>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Count label="Modules" value={c.modules} />
                  <Count label="Assignments" value={c.assignments} />
                  <Count label="Quiz" value={c.quizzes} />
                </div>
              </div>
            </div>
          </article>
        ))}
        {!courses.length && (
          <p className="text-sm text-slate-400">No enrolled courses.</p>
        )}
      </div>
    </>
  );
}
function Count({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-lg bg-slate-50 p-2">
      <b className="block text-sm text-navy">{value}</b>
      <small className="text-[9px] text-slate-400">{label}</small>
    </span>
  );
}
function Certificates({ rows }: { rows: Certificate[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((c) => (
        <article
          key={c.id}
          className="rounded-xl border border-emerald-100 bg-emerald-50 p-5"
        >
          <Award className="text-emerald-600" />
          <b className="mt-3 block text-navy">{c.course}</b>
          <small className="text-emerald-700">
            Issued {new Date(c.date).toLocaleDateString("en-GB")}
          </small>
          {c.url && (
            <a
              href={c.url}
              target="_blank"
              className="mt-3 block text-sm font-semibold text-blue-600"
            >
              Open Certificate
            </a>
          )}
        </article>
      ))}
      {!rows.length && (
        <p className="text-sm text-slate-400">No certificates issued.</p>
      )}
    </div>
  );
}
function PaymentTable({ rows }: { rows: Payment[] }) {
  return (
    <Paged
      rows={rows}
      search={(x) => `${x.title} ${x.method}`}
      headers={["#", "Title", "Payment Method", "Date", "Amount"]}
      render={(x, i) => (
        <tr key={x.id}>
          <td className="p-4">{i}</td>
          <td className="p-4 font-semibold text-navy">{x.title}</td>
          <td className="p-4">{x.method}</td>
          <td className="p-4">
            {new Date(x.date).toLocaleDateString("en-GB")}
          </td>
          <td className="p-4">
            {x.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </td>
        </tr>
      )}
    />
  );
}
function LoginTable({ rows }: { rows: Login[] }) {
  return (
    <Paged
      rows={rows}
      search={(x) => `${x.browser} ${x.platform} ${x.ip}`}
      headers={["#", "Browser", "Platform", "IP Address", "Date"]}
      render={(x, i) => (
        <tr key={x.id}>
          <td className="p-4">{i}</td>
          <td className="p-4 font-semibold text-navy">{x.browser}</td>
          <td className="p-4">{x.platform}</td>
          <td className="p-4">{x.ip}</td>
          <td className="p-4">{new Date(x.date).toLocaleString("en-GB")}</td>
        </tr>
      )}
    />
  );
}
function Paged<T>({
  rows,
  search,
  headers,
  render,
}: {
  rows: T[];
  search: (x: T) => string;
  headers: string[];
  render: (x: T, index: number) => React.ReactNode;
}) {
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    filtered = useMemo(
      () =>
        rows.filter((x) =>
          search(x).toLowerCase().includes(query.toLowerCase()),
        ),
      [rows, query, search],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 10)),
    visible = filtered.slice((page - 1) * 10, page * 10);
  return (
    <>
      <label className="relative block max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="field pl-10"
          placeholder="Search records..."
        />
      </label>
      <div className="mt-5 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              {headers.map((h) => (
                <th key={h} className="p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map((x, i) => render(x, (page - 1) * 10 + i + 1))}
            {!visible.length && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-12 text-center text-slate-400"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="btn-secondary text-xs"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <span className="grid min-w-10 place-items-center rounded-lg bg-navy px-3 text-sm text-white">
          {page}/{pages}
        </span>
        <button
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
          className="btn-secondary text-xs"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </>
  );
}
