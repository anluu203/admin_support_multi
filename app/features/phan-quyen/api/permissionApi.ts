import { apiClient } from "@/app/lib/api/client";
import { type Result } from "@/app/lib/api/result";
import { type User, type PaginatedResponse } from "@/app/types/user";
import { type UserQueryParams, type AssignRoleRequest } from "../types/api";
import { NEXT_PUBLIC_API_URL } from "@/app/lib/utils/env";
import { getAccessToken } from "@/app/lib/utils/auth";

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
export async function getCurrentUser() {
  const data = await fetch( `${NEXT_PUBLIC_API_URL}/users/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAccessToken()}`
      }
      
    }

  );
  return data.json();
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
): Promise<PaginatedResponse<User>>{
  // Build query parameters dynamically - only include if values exist
  const queryParams = new URLSearchParams();
  
  if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.role) queryParams.append('role', params.role);
  if (params.status) queryParams.append('status', params.status);

  const url = new URL(`${NEXT_PUBLIC_API_URL}/users`);
  url.search = queryParams.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`
    }
  });

  return response.json();
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
