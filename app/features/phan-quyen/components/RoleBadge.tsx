import React from "react";
import { UserRole } from "@/app/types/user";

interface RoleBadgeProps {
  role: UserRole | string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";

  if (role === UserRole.SuperAdmin) {
    bgColor = "bg-purple-100";
    textColor = "text-purple-700";
  } else if (role === UserRole.SubAdmin) {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
  } else if (role === UserRole.Student) {
    bgColor = "bg-orange-100";
    textColor = "text-orange-700";
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {role}
    </span>
  );
}
