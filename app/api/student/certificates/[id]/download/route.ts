import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function certificateFileName(url: string) {
  try {
    const stored = decodeURIComponent(
      new URL(url).pathname.split("/").pop() || "",
    );
    return stored.replace(/^\d+-/, "") || "certificate.pdf";
  } catch {
    return "certificate.pdf";
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: certificate } = await createAdminClient()
    .from("certificates")
    .select("certificate_url")
    .eq("id", params.id)
    .eq("student_id", user.id)
    .maybeSingle();
  if (!certificate?.certificate_url)
    return Response.json({ error: "Certificate not found" }, { status: 404 });

  const source = await fetch(certificate.certificate_url);
  if (!source.ok || !source.body)
    return Response.json(
      { error: "Certificate could not be downloaded" },
      { status: 502 },
    );

  return new Response(source.body, {
    headers: {
      "Content-Type":
        source.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(certificateFileName(certificate.certificate_url))}`,
      "Cache-Control": "private, no-store",
    },
  });
}
