import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { courses as demoCourses } from "@/lib/demo";

export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data } = await createClient()
    .from("courses")
    .select(
      "title,slug,description,short_description,level,duration_weeks,category:categories(name)",
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();
  const demo = demoCourses.find((course) => course.slug === params.slug);
  const course = data
    ? {
        title: data.title,
        description: data.description || data.short_description || "",
        level: data.level || "Professional",
        school: (data.category as { name?: string } | null)?.name || "BGSB",
        weeks: data.duration_weeks,
      }
    : demo;
  if (!course) notFound();
  return (
    <main>
      <section className="bg-navy px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-red-300">
            {course.school} · {course.level}
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold">{course.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            {course.description}
          </p>
          {course.weeks ? (
            <p className="mt-4 text-sm text-white/60">
              Duration: {course.weeks} months
            </p>
          ) : null}
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-2xl font-bold text-navy">What you’ll learn</h2>
          {[
            "Apply core concepts to real business challenges",
            "Make evidence-led strategic decisions",
            "Collaborate with a global learning community",
            "Complete a practical capstone assessment",
          ].map((item) => (
            <p className="mt-5 flex gap-3" key={item}>
              <CheckCircle2 className="text-red" />
              {item}
            </p>
          ))}
        </div>
        <aside className="card h-fit">
          <b className="text-navy">Interested in this course?</b>
          <p className="my-4 text-sm text-slate-500">
            Enrollment is managed by BGSB and partner organisations.
          </p>
          <Link className="btn-primary w-full" href="/login">
            Sign in to enroll
          </Link>
        </aside>
      </section>
    </main>
  );
}
