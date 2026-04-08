import { UserRole } from "@/app/types/user";

/**
 * Query parameters cho API lấy danh sách users
 */
export interface UserQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
}

/**
 * Request body để assign role cho user
 */
export interface AssignRoleRequest {
  role: UserRole;
}

/**
 * URL params cho trang phân quyền
 */
export interface PermissionPageParams {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  currentPage: number;
}
