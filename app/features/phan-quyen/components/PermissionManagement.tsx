"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { SearchFilterBar } from "@/app/components/molecules/SearchFilterBar";
import { AssignRoleModal } from "@/app/components/organisms/AssignRoleModal";
import { isOk } from "@/app/lib/api/result";
import { getCurrentUser, getUsers, assignRole, deleteUser } from "../api/permissionApi";
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
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // State quản lý modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  /**
   * Helper function để update URL params
   */
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
    [pathname, router, searchParams]
  );

  /**
   * Lấy thông tin user hiện tại (chỉ chạy lần đầu)
   */
  useEffect(() => {
    const fetchMe = async () => {
      const result = await getCurrentUser();
      if (isOk(result)) {
        setCurrentUser(result.data);
      } else {
        // Fallback nếu API chưa sẵn sàng
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
    setIsLoading(true);
    
    const result = await getUsers({
      pageNumber: currentPage,
      pageSize: 10,
      ...(searchTerm ? { searchTerm } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });

    if (isOk(result)) {
      setUsers(result.data.items);
      setTotalCount(result.data.totalCount);
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
      setTotalCount(2);
    }
    
    setIsLoading(false);
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  /**
   * Fetch users khi URL params thay đổi
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  /**
   * Handler: Chỉnh sửa thông tin user
   */
  const handleEdit = useCallback((user: User) => {
    alert(
      `Chức năng chỉnh sửa thông tin cho ${user.fullName} đang được phát triển.`
    );
  }, []);

  /**
   * Handler: Mở modal phân quyền
   */
  const handleAssignRole = useCallback((user: User) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  }, []);

  /**
   * Handler: Xóa user
   */
  const handleDelete = useCallback(
    async (user: User) => {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa người dùng ${user.fullName}? Hành động này không thể hoàn tác.`
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
    [fetchUsers]
  );

  /**
   * Handler: Xác nhận thay đổi role
   */
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
    [selectedUser, fetchUsers]
  );

  /**
   * Handler: Thay đổi search term
   */
  const handleSearchChange = useCallback(
    (val: string) => {
      updateURLParams({ searchTerm: val, pageNumber: 1 });
    },
    [updateURLParams]
  );

  /**
   * Handler: Thay đổi role filter
   */
  const handleRoleChange = useCallback(
    (val: string) => {
      updateURLParams({ role: val, pageNumber: 1 });
    },
    [updateURLParams]
  );

  /**
   * Handler: Thay đổi status filter
   */
  const handleStatusChange = useCallback(
    (val: string) => {
      updateURLParams({ status: val, pageNumber: 1 });
    },
    [updateURLParams]
  );

  /**
   * Handler: Thay đổi trang
   */
  const handlePageChange = useCallback(
    (page: number) => {
      updateURLParams({ pageNumber: page });
    },
    [updateURLParams]
  );

  /**
   * Handler: Đóng modal
   */
  const handleModalClose = useCallback(() => {
    setIsAssignModalOpen(false);
    setSelectedUser(null);
  }, []);

  // Loading state khi chưa có thông tin user
  if (!currentUser) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-screen flex items-center justify-center">
        Đang xác thực thông tin...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-4">
          Quản lý người dùng
        </h1>
        <p className="text-sm text-gray-500">
          Quản trị thành viên, phân quyền và trạng thái hoạt động trong hệ
          thống.
        </p>
      </div>

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
          isLoading={isLoading}
          currentPage={currentPage}
          totalCount={totalCount}
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
