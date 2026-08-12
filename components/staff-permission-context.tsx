"use client";

import { createContext, useContext } from "react";

export type StaffPermissionSet = Record<string, Record<string, boolean>>;
const StaffPermissionContext = createContext<StaffPermissionSet | null>(null);

export function StaffPermissionProvider({
  permissions,
  children,
}: {
  permissions: StaffPermissionSet;
  children: React.ReactNode;
}) {
  return (
    <StaffPermissionContext.Provider value={permissions}>
      {children}
    </StaffPermissionContext.Provider>
  );
}

export function useStaffCan(module: string, action: string) {
  const permissions = useContext(StaffPermissionContext);
  // Shared Admin components remain unrestricted outside the Staff portal.
  return permissions === null || !!permissions[module]?.[action];
}

export function useStaffHasModule(module: string) {
  const permissions = useContext(StaffPermissionContext);
  return (
    permissions === null ||
    Object.values(permissions[module] || {}).some(Boolean)
  );
}

export function useIsStaffPortal() {
  return useContext(StaffPermissionContext) !== null;
}
