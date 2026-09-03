type CurriculumClient = {
  from: (table: string) => any;
};

export async function loadCurriculumModules(
  db: CurriculumClient,
  courseId: string,
  assignmentFields = "id,title,pass_marks,due_date,file_url",
) {
  const relations = `lessons(id,title,content_type,content_url,description,position),quizzes(id,title,time_limit_minutes,quiz_questions(id,question,question_type,options,correct_option)),assignments(${assignmentFields})`;
  const current = await db
    .from("course_modules")
    .select(`id,title,description,position,${relations}`)
    .eq("course_id", courseId)
    .order("position")
    .order("position", { referencedTable: "lessons" });

  if (!current.error) return current;

  // Keep existing modules visible while a production database is waiting for
  // the latest quiz migration. Quiz editing still requires the migration.
  const legacyRelations = `lessons(id,title,content_type,content_url,description,position),quizzes(id,title,time_limit_minutes),assignments(${assignmentFields})`;
  return db
    .from("course_modules")
    .select(`id,title,description,position,${legacyRelations}`)
    .eq("course_id", courseId)
    .order("position")
    .order("position", { referencedTable: "lessons" });
}
