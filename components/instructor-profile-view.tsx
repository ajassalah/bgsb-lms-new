"use client";
import { useState } from "react";
import { BookOpen, Download, FileText, Radio } from "lucide-react";
type Instructor = {
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string;
  organization: string;
  designation: string | null;
  website: string | null;
  expertises: string[];
  address: string | null;
  country: string | null;
  about: string | null;
  avatar_url: string | null;
  followers: number;
  following: number;
  education: {
    education: string;
    field_of_study: string;
    college: string;
    university: string;
    graduation_year: string;
  }[];
  professional: {
    company: string;
    designation: string;
    years_experience: string;
    note: string;
  }[];
  resume_url: string | null;
};
type Course = {
  id: string;
  title: string;
  thumbnail: string | null;
  status: string;
};
type Live = {
  id: string;
  title: string;
  thumbnail: string | null;
  description: string;
  link: string | null;
};
export function InstructorProfileView({
  instructor,
  courses,
  liveClasses,
  entity = "Instructor",
}: {
  instructor: Instructor;
  courses: Course[];
  liveClasses: Live[];
  entity?: "Instructor" | "Staff";
}) {
  const [tab, setTab] = useState<
    "courses" | "live" | "education" | "professional" | "documents"
  >("courses");
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">{entity} / View</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{entity} Profile</h1>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[370px_1fr]">
        <aside className="h-fit rounded-2xl border bg-white p-6">
          {instructor.avatar_url ? (
            <img
              src={instructor.avatar_url}
              alt=""
              className="mx-auto size-40 rounded-full object-cover ring-4 ring-slate-100"
            />
          ) : (
            <span className="mx-auto grid size-40 place-items-center rounded-full bg-navy text-4xl font-bold text-white">
              {instructor.full_name[0]}
            </span>
          )}
          <h2 className="mt-4 text-center text-xl font-bold text-navy">
            {instructor.full_name}
          </h2>
          <p className="text-center text-sm text-slate-400">
            {instructor.designation || entity}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-4">
              <b className="block text-xl text-navy">{instructor.followers}</b>
              <small className="text-slate-400">Followers</small>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <b className="block text-xl text-navy">{instructor.following}</b>
              <small className="text-slate-400">Following</small>
            </div>
          </div>
          <section className="mt-6 border-t pt-5">
            <h3 className="font-bold text-navy">Expertises</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {instructor.expertises.map((x) => (
                <span
                  key={x}
                  className="rounded-full bg-red/10 px-3 py-1 text-xs font-semibold text-red"
                >
                  {x}
                </span>
              ))}
            </div>
          </section>
          <section className="mt-6 border-t pt-5">
            <h3 className="font-bold text-navy">Personal Information</h3>
            <Info label="First Name" value={instructor.first_name} />
            <Info label="Last Name" value={instructor.last_name} />
            <Info label="Phone Number" value={instructor.phone} />
            <Info label="Email Address" value={instructor.email} />
            <Info label="Organization" value={instructor.organization} />
            <Info label="Designation" value={instructor.designation} />
            {instructor.website && (
              <Info label="Website" value={instructor.website} />
            )}
            <Info label="Address" value={instructor.address} />
            <Info label="Country" value={instructor.country} />
            <Info label="About" value={instructor.about} />
          </section>
        </aside>
        <main className="min-w-0 rounded-2xl border bg-white">
          <div className="flex gap-2 overflow-x-auto border-b p-2">
            <button
              onClick={() => setTab("courses")}
              className={`rounded-lg px-5 py-3 text-sm font-semibold ${tab === "courses" ? "bg-red text-white" : "text-slate-500"}`}
            >
              Courses
            </button>
            <button
              onClick={() => setTab("live")}
              className={`rounded-lg px-5 py-3 text-sm font-semibold ${tab === "live" ? "bg-red text-white" : "text-slate-500"}`}
            >
              Live Classes
            </button>
            <button
              onClick={() => setTab("education")}
              className={`rounded-lg px-5 py-3 text-sm font-semibold ${tab === "education" ? "bg-red text-white" : "text-slate-500"}`}
            >
              Education Background
            </button>
            <button
              onClick={() => setTab("professional")}
              className={`rounded-lg px-5 py-3 text-sm font-semibold ${tab === "professional" ? "bg-red text-white" : "text-slate-500"}`}
            >
              Professional Details
            </button>
            <button
              onClick={() => setTab("documents")}
              className={`whitespace-nowrap rounded-lg px-5 py-3 text-sm font-semibold ${tab === "documents" ? "bg-red text-white" : "text-slate-500"}`}
            >
              Documents
            </button>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            {tab === "courses" &&
              courses.map((c) => (
                <article
                  key={c.id}
                  className="overflow-hidden rounded-xl border"
                >
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-40 place-items-center bg-slate-100">
                      <BookOpen className="text-slate-300" />
                    </span>
                  )}
                  <div className="p-4">
                    <b className="text-navy">{c.title}</b>
                    <p className="mt-2 text-xs capitalize text-slate-400">
                      {c.status}
                    </p>
                  </div>
                </article>
              ))}
            {tab === "live" &&
              liveClasses.map((l) => (
                <article
                  key={l.id}
                  className="overflow-hidden rounded-xl border"
                >
                  {l.thumbnail ? (
                    <img
                      src={l.thumbnail}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-40 place-items-center bg-slate-100">
                      <Radio className="text-slate-300" />
                    </span>
                  )}
                  <div className="p-4">
                    <b className="text-navy">{l.title}</b>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {l.description}
                    </p>
                    {l.link && (
                      <a
                        href={l.link}
                        target="_blank"
                        className="mt-3 block text-sm font-semibold text-blue-600"
                      >
                        Open Live Class
                      </a>
                    )}
                  </div>
                </article>
              ))}
            {tab === "education" &&
              instructor.education.map((e, i) => (
                <article key={i} className="rounded-xl border bg-slate-50 p-5">
                  <b className="text-navy">{e.education}</b>
                  <p className="mt-2 text-sm text-slate-500">
                    {e.field_of_study}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    {e.college} · {e.university} · {e.graduation_year}
                  </p>
                </article>
              ))}
            {tab === "professional" &&
              instructor.professional.map((p, i) => (
                <article key={i} className="rounded-xl border bg-slate-50 p-5">
                  <b className="text-navy">{p.company}</b>
                  <p className="mt-2 text-sm text-slate-500">
                    {p.designation} · {p.years_experience} years
                  </p>
                  <p className="mt-3 text-xs text-slate-400">{p.note}</p>
                </article>
              ))}
            {tab === "documents" && instructor.resume_url && (
              <article className="flex items-center gap-4 rounded-xl border bg-slate-50 p-5 md:col-span-2">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-red/10 text-red">
                  <FileText className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-navy">Professional Resume</b>
                  <p className="mt-1 text-sm text-slate-400">
                    Uploaded under Professional Documents &amp; Links
                  </p>
                </div>
                <a
                  href={instructor.resume_url}
                  target="_blank"
                  download
                  className="btn-secondary gap-2 whitespace-nowrap"
                >
                  <Download className="size-4" />
                  Download
                </a>
              </article>
            )}
            {tab === "courses" && !courses.length && (
              <p className="text-sm text-slate-400">No assigned courses.</p>
            )}
            {tab === "live" && !liveClasses.length && (
              <p className="text-sm text-slate-400">
                No assigned live classes.
              </p>
            )}
            {tab === "education" && !instructor.education.length && (
              <p className="text-sm text-slate-400">
                No education background added.
              </p>
            )}
            {tab === "professional" && !instructor.professional.length && (
              <p className="text-sm text-slate-400">
                No professional details added.
              </p>
            )}
            {tab === "documents" && !instructor.resume_url && (
              <p className="text-sm text-slate-400">
                No professional documents uploaded.
              </p>
            )}
          </div>
        </main>
      </div>
    </>
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
      <b className="block text-sm text-navy">{value || "—"}</b>
    </div>
  );
}
