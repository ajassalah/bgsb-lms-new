import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";

async function allowed(action: "edit" | "delete") {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "curriculum", action);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      question_type: z.enum(["single_radio", "single_dropdown"]),
      question: z.string().trim().min(2),
      options: z.array(z.string().trim().min(1)).min(2),
      correct_option: z.number().int().min(0),
      time_limit_minutes: z.number().int().min(1).max(1440),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Enter a valid question and at least two options" },
      { status: 400 },
    );
  const admin = createAdminClient();
  if (parsed.data.correct_option >= parsed.data.options.length)
    return Response.json({ error: "Select a correct answer" }, { status: 400 });
  const { time_limit_minutes, correct_option, ...questionValues } = parsed.data;
  const { data, error } = await admin
    .from("quizzes")
    .update({ title: parsed.data.question, time_limit_minutes })
    .eq("id", params.id)
    .select("id,title,time_limit_minutes")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data: existing } = await admin
    .from("quiz_questions")
    .select("id")
    .eq("quiz_id", params.id)
    .order("id")
    .limit(1)
    .maybeSingle();
  const query = existing
    ? admin
        .from("quiz_questions")
        .update({ ...questionValues, correct_option: String(correct_option) })
        .eq("id", existing.id)
    : admin.from("quiz_questions").insert({
        quiz_id: params.id,
        ...questionValues,
        correct_option: String(correct_option),
      });
  const { data: quizQuestion, error: questionError } = await query
    .select("id,question,question_type,options,correct_option")
    .single();
  return questionError
    ? Response.json({ error: questionError.message }, { status: 400 })
    : Response.json({ ...data, quiz_questions: [quizQuestion] });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("quizzes")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
