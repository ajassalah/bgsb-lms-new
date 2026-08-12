import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
export default async function Page({ params }: { params: { type: string } }) {
  if (!["payments", "invoices"].includes(params.type)) notFound();
  const p = await requireProfile("admin_staff"),
    db = createAdminClient(),
    { data } =
      params.type === "payments"
        ? await db
            .from("payments")
            .select(
              "id,title,amount,status,created_at,student:profiles(full_name)",
            )
            .order("created_at", { ascending: false })
        : await db
            .from("invoices")
            .select(
              "id,invoice_number,amount,status,created_at,student:profiles(full_name)",
            )
            .order("created_at", { ascending: false });
  const title = params.type === "payments" ? "Payments" : "Invoices";
  return (
    <StaffPageShell name={p.full_name}>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <section className="mt-7 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">
                {params.type === "payments" ? "Title" : "Invoice"}
              </th>
              <th className="p-4">Student</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data || []).map((x: any, i) => (
              <tr key={x.id}>
                <td className="p-4">{i + 1}</td>
                <td className="p-4 font-semibold text-navy">
                  {x.title || x.invoice_number}
                </td>
                <td className="p-4">{x.student?.full_name || "â€”"}</td>
                <td className="p-4">
                  {Number(x.amount).toLocaleString("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  })}
                </td>
                <td className="p-4 capitalize">{x.status}</td>
                <td className="p-4">
                  {new Date(x.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </StaffPageShell>
  );
}
