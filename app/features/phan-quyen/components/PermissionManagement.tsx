"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { SearchFilterBar } from "@/app/components/molecules/SearchFilterBar";
import { AssignRoleModal } from "@/app/components/organisms/AssignRoleModal";
import { isOk } from "@/app/lib/api/result";
import {
  getCurrentUser,
  getUsers,
  assignRole,
  deleteUser,
} from "../api/permissionApi";
import { UserTable } from "./UserTable";

/**
 * PermissionManagement - Component quản lý phân quyền người dùng
 *
 * Performance Optimizations:
 * - URL params as single source of truth (no duplicate state)
 * - All handlers memoized with useCallback to prevent re-renders
 * - Direct URL updates instead of setState → effect → URL flow
 */
export function PermissionManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL params là nguồn dữ liệu chính
  const searchTerm = searchParams.get("searchTerm") || "";
  const roleFilter = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";
  const currentPage = parseInt(searchParams.get("pageNumber") || "1", 10);

  // State quản lý data
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const updateURLParams = useCallback(
    (updates: {
      searchTerm?: string;
      role?: string;
      status?: string;
      pageNumber?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.searchTerm !== undefined) {
        if (updates.searchTerm) {
          params.set("searchTerm", updates.searchTerm);
        } else {
          params.delete("searchTerm");
        }
      }

      if (updates.role !== undefined) {
        if (updates.role) {
          params.set("role", updates.role);
        } else {
          params.delete("role");
        }
      }

      if (updates.status !== undefined) {
        if (updates.status) {
          params.set("status", updates.status);
        } else {
          params.delete("status");
        }
      }

      if (updates.pageNumber !== undefined) {
        if (updates.pageNumber > 1) {
          params.set("pageNumber", updates.pageNumber.toString());
        } else {
          params.delete("pageNumber");
        }
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const fetchMe = async () => {
      const result = await getCurrentUser();
      if (isOk(result)) {
        setCurrentUser(result.data);
      } else {
        setCurrentUser({
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          role: UserRole.SuperAdmin,
          email: "superadmin@example.com",
          fullName: "Current SuperAdmin",
          status: UserStatus.Active,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          emailVerified: true,
          username: "superadmin",
          phone: null,
          avatarUrl: null,
        });
      }
    };
    fetchMe();
  }, []);

  const fetchUsers = useCallback(async () => {
    const result = await getUsers({
      pageNumber: currentPage,
      pageSize: 10,
      ...(searchTerm ? { searchTerm } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });

    if (isOk(result)) {
      setUsers(result.data.items);
    } else {
      // Mock Data
      setUsers([
        {
          id: "mock-student-1",
          email: "student@example.com",
          username: "student",
          fullName: "Nguyễn Văn Học Viên",
          phone: "0912345678",
          avatarUrl: null,
          role: UserRole.Student,
          status: UserStatus.Active,
          emailVerified: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "mock-subadmin-1",
          email: "admin@example.com",
          username: "adminUser",
          fullName: "Lê Văn Quản Lý",
          phone: "0912345679",
          avatarUrl: null,
          role: UserRole.SubAdmin,
          status: UserStatus.Suspended,
          emailVerified: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleEdit = useCallback((user: User) => {
    alert(
      `Chức năng chỉnh sửa thông tin cho ${user.fullName} đang được phát triển.`,
    );
  }, []);

  const handleAssignRole = useCallback((user: User) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (user: User) => {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa người dùng ${user.fullName}? Hành động này không thể hoàn tác.`,
        )
      ) {
        const result = await deleteUser(user.id);
        if (isOk(result)) {
          fetchUsers();
        } else {
          alert(result.error.message || "Xóa thất bại. Vui lòng thử lại.");
        }
      }
    },
    [fetchUsers],
  );

  const handleConfirmRoleChange = useCallback(
    async (newRole: UserRole) => {
      if (!selectedUser) return;

      const result = await assignRole(selectedUser.id, { role: newRole });

      if (isOk(result)) {
        console.log("Firebase token needs reload.");
        fetchUsers();
        setIsAssignModalOpen(false);
      } else {
        alert(result.error.message || "Đổi vai trò thất bại");
      }
    },
    [selectedUser, fetchUsers],
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      updateURLParams({ searchTerm: val, pageNumber: 1 });
    },
    [updateURLParams],
  );

  const handleRoleChange = useCallback(
    (val: string) => {
      updateURLParams({ role: val, pageNumber: 1 });
    },
    [updateURLParams],
  );

  const handleStatusChange = useCallback(
    (val: string) => {
      updateURLParams({ status: val, pageNumber: 1 });
    },
    [updateURLParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateURLParams({ pageNumber: page });
    },
    [updateURLParams],
  );

  const handleModalClose = useCallback(() => {
    setIsAssignModalOpen(false);
    setSelectedUser(null);
  }, []);

  // Loading state khi chưa có thông tin user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleChange={handleRoleChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />

        <UserTable
          users={users}
          currentPage={currentPage}
          totalCount={2}
          pageSize={10}
          onPageChange={handlePageChange}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onEdit={handleEdit}
          onChangeRole={handleAssignRole}
          onDelete={handleDelete}
        />
      </div>

      {/* Assign Role Modal */}
      <AssignRoleModal
        isOpen={isAssignModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onConfirm={handleConfirmRoleChange}
      />
    </div>
  );
}
