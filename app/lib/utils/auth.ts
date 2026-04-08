import { UserRole } from "@/app/types/user";

export type AdminAction = 
  | "view_users" 
  | "edit_user" 
  | "change_role" 
  | "delete_user" 
  | "change_status";

/**
 * Utility function to centralize RBAC logic outside of specific components
 */
export function canPerformAction(currentRole?: UserRole | string, action?: AdminAction): boolean {
  if (!currentRole || !action) return false;

  const role = currentRole as UserRole;

  switch (action) {
    case "view_users":
    case "edit_user":
    case "change_status":
      return role === UserRole.SuperAdmin || role === UserRole.SubAdmin;
    case "change_role":
    case "delete_user":
      return role === UserRole.SuperAdmin;
    default:
      return false;
  }
}
