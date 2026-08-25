import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!(await adminActorCan(user.id, "students", "bulk_import")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File))
    return Response.json({ error: "CSV file required" }, { status: 400 });
  const rows = Papa.parse<any>(await file.text(), {
      header: true,
      skipEmptyLines: true,
    }).data,
    admin = createAdminClient();
  let imported = 0,
    failed = 0;
  for (const row of rows) {
    if (!row.email || !row.first_name || !row.last_name) {
      failed++;
      continue;
    }
    const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(
      String(row.email).trim(),
      { data: { full_name: `${row.first_name} ${row.last_name}` } },
    );
    if (error || !invite.user) {
      failed++;
      continue;
    }
    const code = String(row.phone_country_code || "+94"),
      phone = String(row.phone || "");
    const result = await admin.from("profiles").insert({
      id: invite.user.id,
      role: "student",
      full_name: `${row.first_name} ${row.last_name}`,
      first_name: row.first_name,
      last_name: row.last_name,
      email: String(row.email).toLowerCase(),
      phone_country_code: code,
      phone: `${code}${phone}`,
      whatsapp_number: row.whatsapp_number || `${code}${phone}`,
      country: row.country || "Sri Lanka",
      address: row.address || "Not provided",
      date_of_birth: row.date_of_birth || "2000-01-01",
      gender: row.gender || "prefer_not_to_say",
      nic_passport: row.nic_passport || `PENDING-${Date.now()}`,
      status: "active",
    });
    result.error ? failed++ : imported++;
  }
  return Response.json({ imported, failed });
}
