import { apiClient } from "@/app/lib/api/client";
import { type Result } from "@/app/lib/api/result";
import {
  type ExchangeTokenRequest,
  type LoginRequest,
  type LoginResponse,
  type RefreshTokenRequest,
  type RegisterRequest,
} from "../types/api";

/**
 * Đăng ký tài khoản mới
 * 
 * @example
 * ```ts
 * const result = await register({
 *   email: "user@example.com",
 *   username: "nguyenvana",
 *   password: "Password@123",
 *   fullName: "Nguyễn Văn A"
 * });
 * ```
 */
export async function register(
  data: RegisterRequest
): Promise<Result<string>> {
  return apiClient.post<string>("/auth/register", data);
}

/**
 * Đăng nhập bằng email/password
 * 
 * @example
 * ```ts
 * const result = await login({
 *   email: "user@example.com",
 *   password: "Password@123"
 * });
 * 
 * if (isOk(result)) {
 *   localStorage.setItem("accessToken", result.data.accessToken);
 *   localStorage.setItem("refreshToken", result.data.refreshToken);
 * }
 * ```
 */
export async function login(
  data: LoginRequest
): Promise<Result<LoginResponse>> {
  return apiClient.post<LoginResponse>("/auth/login", data);
}

/**
 * SSO Exchange Token (Firebase)
 * 
 * @example
 * ```ts
 * const firebaseToken = await auth.currentUser?.getIdToken();
 * const result = await exchangeToken({ firebaseIdToken: firebaseToken });
 * ```
 */
export async function exchangeToken(
  data: ExchangeTokenRequest
): Promise<Result<LoginResponse>> {
  return apiClient.post<LoginResponse>("/auth/exchange-token", data);
}

/**
 * Refresh access token
 * 
 * @example
 * ```ts
 * const refreshToken = localStorage.getItem("refreshToken");
 * const result = await refreshAccessToken({ refreshToken });
 * 
 * if (isOk(result)) {
 *   localStorage.setItem("accessToken", result.data.accessToken);
 *   localStorage.setItem("refreshToken", result.data.refreshToken);
 * }
 * ```
 */
export async function refreshAccessToken(
  data: RefreshTokenRequest
): Promise<Result<LoginResponse>> {
  return apiClient.post<LoginResponse>("/auth/refresh", data);
}
