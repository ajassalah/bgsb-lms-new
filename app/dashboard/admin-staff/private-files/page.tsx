import { StaffPageShell } from "@/components/staff-page-shell";
import {
  PrivateFileManager,
  type PrivateItem,
} from "@/components/private-file-manager";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    admin = createAdminClient(),
    { data } = await admin
      .from("private_files")
      .select(
        "id,parent_id,name,item_type,size_bytes,created_at,updated_at,mime_type,storage_path",
      )
      .eq("user_id", p.id)
      .order("created_at", { ascending: false });
  return (
    <StaffPageShell name={p.full_name}>
      <PrivateFileManager
        initialItems={
          (data || []).map((x: any) => ({
            ...x,
            url: x.storage_path
              ? admin.storage.from("course-media").getPublicUrl(x.storage_path)
                  .data.publicUrl
              : null,
          })) as PrivateItem[]
        }
      />
    </StaffPageShell>
  );
}
