import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  CategoryManagement,
  type AdminCategory,
} from "@/components/category-management";
export default async function CategoriesPage() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("categories")
      .select("id,name,is_active,courses(count)")
      .order("name");
  const categories: AdminCategory[] = (data || []).map((x: any) => ({
    id: x.id,
    name: x.name,
    active: x.is_active,
    courseCount: x.courses?.[0]?.count || 0,
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <CategoryManagement initialCategories={categories} />
    </StaffPageShell>
  );
}
