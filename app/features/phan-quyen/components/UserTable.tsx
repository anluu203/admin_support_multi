"use client";

import  { useMemo } from "react";
import { User, UserRole } from "@/app/types/user";
import { Table, TableColumn } from "@/app/components/organisms/Table";
import { StatusBadge } from "@/app/components/atoms/StatusBadge";
import { RoleBadge } from "@/app/features/phan-quyen/components/RoleBadge";
import { Text } from "@/app/components/atoms/Text";
import { UserActionButtons } from "@/app/components/molecules/UserActionButtons";

interface UserTableProps {
  users: User[];
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  currentUserId: string;
  currentUserRole: UserRole | string;
  onEdit: (user: User) => void;
  onChangeRole: (user: User) => void;
  onDelete: (user: User) => void;
}


export function UserTable({
  users,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  currentUserId,
  currentUserRole,
  onEdit,
  onChangeRole,
  onDelete,
}: UserTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns = useMemo<TableColumn<User>[]>(
    () => [
      {
        key: "fullName",
        header: "Người dùng",
        render: (user) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {user.avatarUrl ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user.avatarUrl}
                  alt=""
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-4">
              <Text weight="medium" size="sm">
                {user.fullName}
              </Text>
              <Text size="sm" color="muted">
                {user.email}
              </Text>
            </div>
          </div>
        ),
      },
      {
        key: "phone",
        header: "Số điện thoại",
        render: (user) => (
          <Text size="sm" color="muted">
            {user.phone || "—"}
          </Text>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        render: (user) => <StatusBadge status={user.status} />,
      },
      {
        key: "role",
        header: "Vai trò",
        render: (user) => <RoleBadge role={user.role} />,
      },
      {
        key: "actions",
        header: "Thao tác",
        render: (user) => (
          <div className="flex justify-end">
            <UserActionButtons
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              targetUserId={user.id}
              onEdit={() => onEdit(user)}
              onChangeRole={() => onChangeRole(user)}
              onDelete={() => onDelete(user)}
            />
          </div>
        ),
      },
    ],
    [currentUserId, currentUserRole, onEdit, onChangeRole, onDelete],
  );

  return (
    <div>
      {/* Main Table */}
      <Table<User>
        columns={columns}
        data={users}
        className="rounded-t-lg"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-background-surface px-4 py-3 border-t border-b border-border flex items-center justify-between sm:px-6 rounded-b-lg">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <Text size="sm" color="muted">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                trong <span className="font-medium">{totalCount}</span> kết quả
              </Text>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-background-muted text-text hover:bg-border"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span
                      key={page}
                      className="px-2 py-1 text-sm text-text-muted"
                    >
                      …
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
