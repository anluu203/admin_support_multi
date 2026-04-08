import React from "react";
import { UserStatus } from "@/app/types/user";

interface StatusBadgeProps {
  status: UserStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";

  if (status === UserStatus.Active) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  } else if (status === UserStatus.Inactive) {
    bgColor = "bg-gray-100";
    textColor = "text-gray-700";
  } else if (status === UserStatus.Suspended) {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}
