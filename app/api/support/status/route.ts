import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await createAdminClient()
      .from("support_faqs")
      .select("id", { head: true, count: "exact" });
    return Response.json(
      {
        status: error ? "degraded" : "operational",
        checked_at: new Date().toISOString(),
      },
      { status: error ? 503 : 200 },
    );
  } catch {
    return Response.json(
      { status: "unavailable", checked_at: new Date().toISOString() },
      { status: 503 },
    );
  }
}
