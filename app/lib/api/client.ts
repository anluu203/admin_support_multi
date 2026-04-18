import { type ApiResponse } from "@/app/types/api";
import { err, ok, type Result } from "./result";
import { getAccessToken } from "../utils/auth";

/**
 * Base URL của API Backend
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.dangcapnc.io.vn/api";

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Path parameters (thay thế trong URL) */
  pathParams?: Record<string, string>;
}

/**
 * Xây dựng URL với query params
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  pathParams?: Record<string, string>
): string {
  let url = endpoint;

  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
  }

  if (params) {
    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join("&");

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return `${API_BASE_URL}${url}`;
}


/**
 * Handle API response và convert sang Result<T>
 */
async function handleResponse<T>(response: Response): Promise<Result<T>> {
  try {
    const data: ApiResponse<T> = await response.json();
    console.log("API Response:", data);
    if (data.isSuccess && data.data !== null) {
      return ok(data.data);
    }

    return err({
      message: data.error || "Đã xảy ra lỗi",
      code: response.status.toString(),
    });
  } catch (error) {
    return err({
      message: "Không thể parse response từ server",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// ─── Token refresh (module-level để tránh duplicate concurrent refresh) ───────

let _isRefreshing = false;
let _refreshPromise: Promise<boolean> | null = null;

/**
 * Thử refresh access token. Nếu đang refresh thì các caller khác sẽ đợi cùng
 * một Promise thay vì gửi nhiều request refresh song song.
 */
async function tryRefreshToken(): Promise<boolean> {
  if (_isRefreshing && _refreshPromise) return _refreshPromise;

  _isRefreshing = true;
  _refreshPromise = (async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined") return false;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.isSuccess && data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
}

// ─── API Client ───────────────────────────────────────────────────────────────

/**
 * Base API Client
 *
 * Tất cả các HTTP method đều đi qua `request()` trung tâm để:
 * - Tự động gắn Bearer token
 * - Tự động refresh token khi nhận 401, retry request gốc
 * - Redirect về /login nếu refresh thất bại
 */
class ApiClient {
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    const makeRequest = async (): Promise<Response> => {
      const url = buildUrl(endpoint, options?.params, options?.pathParams);
      const token = getAccessToken();
      const init: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      };
      if (body !== undefined) {
        init.body = JSON.stringify(body);
      }
      return fetch(url, init);
    };

    try {
      let response = await makeRequest();

      // Tự động refresh token khi hết hạn
      if (response.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          response = await makeRequest(); // Retry với token mới
        } else {
          redirectToLogin();
          return err({
            message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại",
            code: "401",
          });
        }
      }

      // DELETE thường trả 204 No Content
      if (method === "DELETE" && response.status === 204) {
        return ok(null as T);
      }

      return handleResponse<T>(response);
    } catch (error) {
      return err({
        message: "Không thể kết nối đến server",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<Result<T>> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    return this.request<T>("POST", endpoint, body, options);
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    return this.request<T>("PUT", endpoint, body, options);
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    return this.request<T>("PATCH", endpoint, body, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<Result<T>> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

/**
 * API client instance
 */
export const apiClient = new ApiClient();
