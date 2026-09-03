import { z } from "zod";

export const intakeSchema = z.object({
  course_id: z.string().uuid(),
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  type: z.enum(["regular", "late", "early"]),
  year: z.coerce.number().int().min(2000).max(2200),
  status: z.enum(["active", "inactive", "draft"]),
});

export const batchSchema = z.object({
  course_id: z.string().uuid(),
  intake_id: z.string().uuid(),
  batch_name: z.string().trim().min(2),
  start_date: z.string().min(1),
  duration_value: z.coerce.number().int().positive(),
  duration_unit: z.enum(["days", "weeks", "months", "years"]),
  status: z.enum(["active", "inactive", "draft"]).default("draft"),
});
