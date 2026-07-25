import {redirect} from 'next/navigation';
import {requireProfile} from '@/lib/auth';
import {createClient} from '@/lib/supabase/server';

export default async function CourseAssignments({params}:{params:{id:string}}){
  await requireProfile('super_admin');
  const {data:module}=await createClient()
    .from('course_modules')
    .select('id')
    .eq('course_id',params.id)
    .order('position')
    .limit(1)
    .maybeSingle();

  redirect(module
    ? `/dashboard/super-admin/courses/${params.id}/curriculum/${module.id}/assignments`
    : `/dashboard/super-admin/courses/${params.id}/curriculum`);
}
