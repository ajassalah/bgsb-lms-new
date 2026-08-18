"use client";

import { Eye, FileText, MoreVertical, X } from "lucide-react";
import { useState } from "react";

export type ModuleStudentAssignment = {
  id: string;
  title: string;
  start: string;
  deadline: string;
  marks: number;
  scoredMarks: number | null;
  status: string;
  submissionStatus: string;
  feedback: string | null;
  description: string | null;
  fileUrl: string | null;
};

export function ModuleStudentAssignments({
  courseTitle,
  moduleTitle,
  studentName,
  initialRows,
}: {
  courseTitle: string;
  moduleTitle: string;
  studentId: string;
  studentName: string;
  initialRows: ModuleStudentAssignment[];
}) {
  const [menu, setMenu] = useState<string | null>(null),
    [selected, setSelected] = useState<ModuleStudentAssignment | null>(null);
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">
          Assignments / {courseTitle} / {studentName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{moduleTitle}</h1>
      </div>
      <section className="mt-7 overflow-visible rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Marks</th>
                <th className="p-4">Status</th>
                <th className="p-4">Feedback</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {initialRows.map((row) => (
                <tr key={row.id}>
                  <td className="p-4 font-bold text-navy">{row.title}</td>
                  <td className="p-4">
                    {new Date(row.start).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">
                    {new Date(row.deadline).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">
                    {row.scoredMarks === null
                      ? `Not graded / ${row.marks}`
                      : `${row.scoredMarks} / ${row.marks}`}
                  </td>
                  <td className="p-4 capitalize">
                    {row.status.replace("_", " ")}
                  </td>
                  <td className="max-w-64 truncate p-4">
                    {row.feedback || "No feedback"}
                  </td>
                  <td className="relative p-4">
                    <button
                      onClick={() => setMenu(menu === row.id ? null : row.id)}
                      className="ml-auto grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === row.id && (
                      <div className="absolute right-4 top-14 z-[100] w-40 rounded-xl border bg-white p-1 shadow-2xl">
                        <button
                          onClick={() => {
                            setSelected(row);
                            setMenu(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <Eye className="size-4" />
                          View
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!initialRows.length && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No assignments in this module.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Submitted Assignment</p>
                <h2 className="text-xl font-bold text-navy">
                  {selected.title}
                </h2>
              </div>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Detail
                label="Marks"
                value={
                  selected.scoredMarks === null
                    ? `Not graded / ${selected.marks}`
                    : `${selected.scoredMarks} / ${selected.marks}`
                }
              />
              <Detail
                label="Submission Status"
                value={selected.submissionStatus}
              />
              <Detail
                label="Review Status"
                value={selected.status.replace("_", " ")}
              />
              <Detail
                label="Feedback"
                value={selected.feedback || "No feedback"}
              />
            </div>
            {selected.description && (
              <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                <small className="font-bold uppercase text-slate-400">
                  Description
                </small>
                <p className="mt-2 text-sm">{selected.description}</p>
              </div>
            )}
            {selected.fileUrl && (
              <a
                href={selected.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-5 w-full gap-2"
              >
                <FileText className="size-4" />
                Open Submitted Assignment
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <small className="font-bold uppercase text-slate-400">{label}</small>
      <p className="mt-2 font-semibold capitalize text-navy">{value}</p>
    </div>
  );
}
