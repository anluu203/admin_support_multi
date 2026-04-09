"use client";

import React, { useState, useEffect } from "react";
import { User, UserRole } from "@/app/types/user";
import { Modal } from "@/app/components/molecules/Modal";
import { Radio } from "@/app/components/atoms/Radio";
import { Button } from "@/app/components/atoms/Button";
import { Text } from "@/app/components/atoms/Text";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (role: UserRole) => Promise<void>;
}

/**
 * Role description mapping
 */
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: "Toàn quyền hệ thống",
  [UserRole.SubAdmin]: "Quản lý Chat Rooms, học viên, RAG",
  [UserRole.Student]: "Chỉ thao tác trên dữ liệu cá nhân",
};

/**
 * AssignRoleModal - Modal phân quyền người dùng
 * 
 * Sử dụng Modal component có sẵn + Radio/Button/Text components
 */
export function AssignRoleModal({
  isOpen,
  onClose,
  user,
  onConfirm,
}: AssignRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Student);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setSelectedRole(user.role);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(selectedRole);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isRoleChanged = selectedRole !== user.role;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Phân quyền người dùng"
      size="md"
      ariaLabel="Phân quyền người dùng"
    >
      {/* User Info */}
      <div>
        <Text size="sm" color="muted">
          Thay đổi vai trò cho người dùng{" "}
          <span className="font-semibold text-text">{user.fullName}</span> (
          {user.email}).
        </Text>
      </div>

      <div className="h-6" />

      {/* Role Options */}
      <div className="space-y-3">
        {Object.values(UserRole).map((role) => (
          <label
            key={role}
            className="flex items-start gap-4 p-4 border border-border rounded-lg cursor-pointer transition-all hover:bg-background-muted hover:border-primary"
          >
            <div className="pt-1">
              <Radio
                name="role"
                value={role}
                checked={selectedRole === role}
                onChange={() => setSelectedRole(role)}
              />
            </div>
            <div className="flex-1">
              <Text weight="medium" size="sm">
                {role === UserRole.SuperAdmin && "Super Admin"}
                {role === UserRole.SubAdmin && "Võ sư / Sub Admin"}
                {role === UserRole.Student && "Học viên"}
              </Text>
              <Text size="xs" color="muted" className="mt-1">
                {ROLE_DESCRIPTIONS[role]}
              </Text>
            </div>
          </label>
        ))}
      </div>

      <div className="h-6" />

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleConfirm}
          disabled={!isRoleChanged || isLoading}
          isLoading={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Xác nhận đổi quyền"}
        </Button>
      </div>
    </Modal>
  );
}
