import React from "react";
import { Edit2, ShieldAlert, Trash2, ShieldCheck } from "lucide-react";
import { UserRole } from "@/app/types/user";
import { canPerformAction } from "@/app/lib/utils/auth";

interface UserActionButtonsProps {
  currentUserId: string;
  currentUserRole: UserRole | string;
  targetUserId: string;
  onEdit: () => void;
  onChangeRole: () => void;
  onDelete: () => void;
}

export function UserActionButtons({
  currentUserId,
  currentUserRole,
  targetUserId,
  onEdit,
  onChangeRole,
  onDelete,
}: UserActionButtonsProps) {
  const isSelf = currentUserId === targetUserId;

  const canEdit = canPerformAction(currentUserRole, "edit_user");
  const canChangeRole = canPerformAction(currentUserRole, "change_role");
  const canDelete = canPerformAction(currentUserRole, "delete_user") && !isSelf;

  return (
    <div className="flex items-center space-x-3 text-sm">
      {canEdit && (
        <button
          onClick={onEdit}
          className="text-indigo-600 hover:text-indigo-900 transition-colors"
          title="Chỉnh sửa thông tin"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}

      {canChangeRole && (
        <button
          onClick={onChangeRole}
          className="text-purple-600 hover:text-purple-900 transition-colors"
          title="Phân quyền"
        >
          <ShieldAlert className="h-4 w-4" />
        </button>
      )}

      {canDelete && (
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Xóa người dùng"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
