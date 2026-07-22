export const roles=['super_admin','admin_staff','organization','org_staff','instructor','student'] as const;
export type Role=typeof roles[number];
export const roleLabels:Record<Role,string>={super_admin:'Super Admin',admin_staff:'Admin Staff',organization:'Organization',org_staff:'Org Staff',instructor:'Instructor',student:'Student'};
