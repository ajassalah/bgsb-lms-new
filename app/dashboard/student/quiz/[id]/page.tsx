import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock3, HelpCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { QuizQuestionDisplay } from "@/components/quiz-question-display";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StudentQuizOverview({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("student");
  const admin = createAdminClient();
  const [{ data: enrollment }, { data: course }, { data: modules }] =
    await Promise.all([
      admin
        .from("enrollments")
        .select("id")
        .eq("student_id", profile.id)
        .eq("course_id", params.id)
        .in("status", ["approved", "completed"])
        .maybeSingle(),
      admin
        .from("courses")
        .select("id,title")
        .eq("id", params.id)
        .maybeSingle(),
      admin
        .from("course_modules")
        .select(
          "id,title,position,quizzes(id,title,time_limit_minutes,quiz_questions(id,question,question_type,options,correct_option))",
        )
        .eq("course_id", params.id)
        .order("position"),
    ]);
  if (!enrollment || !course) notFound();
  const quizModules = (modules || []).filter(
    (module: any) => module.quizzes?.length,
  );

  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <Link href="/dashboard/student/quiz" className="btn-secondary gap-2">
        <ArrowLeft className="size-4" /> Back to Quiz
      </Link>
      <div className="mt-6 max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
          Course Quizzes
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy dark:text-white">
          {course.title}
        </h1>

        <div className="mt-6 space-y-6">
          {quizModules.map((module: any, moduleIndex: number) => (
            <section
              key={module.id}
              className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6"
            >
              <header className="mb-5 flex items-center gap-3 border-b pb-4 dark:border-slate-700">
                <span className="grid size-10 place-items-center rounded-xl bg-red/10 text-red">
                  <BookOpen className="size-5" />
                </span>
                <div>
                  <small className="text-slate-400">
                    Module {moduleIndex + 1}
                  </small>
                  <h2 className="font-bold text-navy dark:text-white">
                    {module.title}
                  </h2>
                </div>
              </header>
              <div className="space-y-5">
                {module.quizzes.map((quiz: any, quizIndex: number) => (
                  <article
                    key={quiz.id}
                    className="rounded-xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30 sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="size-5 shrink-0 text-violet-600" />
                      <b className="text-navy dark:text-white">
                        Quiz {quizIndex + 1}
                      </b>
                      <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="size-3.5" />{" "}
                        {quiz.time_limit_minutes || 15} min
                      </span>
                    </div>
                    <QuizQuestionDisplay
                      quizId={quiz.id}
                      title={quiz.title}
                      questions={quiz.quiz_questions}
                      persistenceKey={profile.id}
                    />
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!quizModules.length && (
            <section className="rounded-2xl border bg-white p-12 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              No quizzes are available for this course.
            </section>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
