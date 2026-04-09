import { apiClient } from "@/app/lib/api/client";
import { type Result } from "@/app/lib/api/result";
import { type User, type PaginatedResponse } from "@/app/types/user";
import { type UserQueryParams, type AssignRoleRequest } from "../types/api";

/**
 * Lấy thông tin user hiện tại
 * 
 * @example
 * ```ts
 * const result = await getCurrentUser();
 * if (isOk(result)) {
 *   console.log(result.data.fullName);
 * }
 * ```
 */
export async function getCurrentUser(): Promise<Result<User>> {
  return apiClient.get<User>("/users/me");
}

/**
 * Lấy danh sách users với filter và pagination
 * 
 * @example
 * ```ts
 * const result = await getUsers({
 *   pageNumber: 1,
 *   pageSize: 10,
 *   searchTerm: "nguyen",
 *   role: "Student",
 *   status: "Active"
 * });
 * ```
 */
export async function getUsers(
  params: UserQueryParams
): Promise<Result<PaginatedResponse<User>>> {
  return apiClient.get<PaginatedResponse<User>>("/users", { params });
}

/**
 * Phân quyền (assign role) cho user
 * 
 * @example
 * ```ts
 * const result = await assignRole("user-id-123", { role: UserRole.SubAdmin });
 * if (isOk(result)) {
 *   console.log("Phân quyền thành công");
 * }
 * ```
 */
export async function assignRole(
  userId: string,
  data: AssignRoleRequest
): Promise<Result<void>> {
  return apiClient.post<void>(`/users/${userId}/assign-role`, data);
}

/**
 * Xóa user
 * 
 * @example
 * ```ts
 * const result = await deleteUser("user-id-123");
 * if (isOk(result)) {
 *   console.log("Xóa user thành công");
 * }
 * ```
 */
export async function deleteUser(userId: string): Promise<Result<void>> {
  return apiClient.delete<void>(`/users/${userId}`);
}
