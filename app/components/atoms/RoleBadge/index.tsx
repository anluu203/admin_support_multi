import React from "react";
import { Badge } from "@/app/components/atoms/Badge";
import { UserRole } from "@/app/types/user";

interface RoleBadgeProps {
  role: UserRole | string;
}

/**
 * RoleBadge - Hiển thị badge cho vai trò người dùng
 * 
 * @example
 * ```tsx
 * <RoleBadge role={UserRole.SuperAdmin} />
 * <RoleBadge role={UserRole.SubAdmin} />
 * <RoleBadge role={UserRole.Student} />
 * ```
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig: Record<UserRole, { label: string; variant: "success" | "warning" | "error" | "info" | "default" }> = {
    [UserRole.SuperAdmin]: { 
      label: "Super Admin",
      variant: "error" 
    },
    [UserRole.SubAdmin]: { 
      label: "Sub Admin",
      variant: "warning" 
    },
    [UserRole.Student]: { 
      label: "Học viên",
      variant: "info" 
    },
  };

  const config = roleConfig[role as UserRole];
  
  if (!config) {
    return <Badge variant="default">{role}</Badge>;
  }

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
