import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "curriculum", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      course_id: z.string().uuid(),
      module_id: z.string().uuid(),
      question_type: z.enum(["single_radio", "single_dropdown"]),
      question: z.string().trim().min(2),
      options: z.array(z.string().trim().min(1)).min(2),
      correct_option: z.number().int().min(0),
      time_limit_minutes: z.number().int().min(1).max(1440),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid quiz" }, { status: 400 });
  const admin = createAdminClient();
  const { question, question_type, options, correct_option, ...quizValues } =
    parsed.data;
  if (correct_option >= options.length)
    return Response.json({ error: "Select a correct answer" }, { status: 400 });
  const { data, error } = await admin
    .from("quizzes")
    .insert({ ...quizValues, title: question })
    .select("id,title,time_limit_minutes")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data: quizQuestion, error: questionError } = await admin
    .from("quiz_questions")
    .insert({
      quiz_id: data.id,
      question,
      question_type,
      options,
      correct_option: String(correct_option),
    })
    .select("id,question,question_type,options,correct_option")
    .single();
  if (questionError) {
    await admin.from("quizzes").delete().eq("id", data.id);
    return Response.json({ error: questionError.message }, { status: 400 });
  }
  return Response.json({ ...data, quiz_questions: [quizQuestion] });
}
