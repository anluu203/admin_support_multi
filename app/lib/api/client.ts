import { type ApiResponse } from "@/app/types/api";
import { err, ok, type Result } from "./result";

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

  // Thay thế path params
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
  }

  // Thêm query params
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
 * Lấy access token từ localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
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

/**
 * Base API Client
 */
class ApiClient {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<Result<T>> {
    try {
      const url = buildUrl(endpoint, options?.params, options?.pathParams);
      const token = getAccessToken();

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      });

      return handleResponse<T>(response);
    } catch (error) {
      return err({
        message: "Không thể kết nối đến server",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    try {
      const url = buildUrl(endpoint, options?.params, options?.pathParams);
      const token = getAccessToken();

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });

      return handleResponse<T>(response);
    } catch (error) {
      return err({
        message: "Không thể kết nối đến server",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    try {
      const url = buildUrl(endpoint, options?.params, options?.pathParams);
      const token = getAccessToken();

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });

      return handleResponse<T>(response);
    } catch (error) {
      return err({
        message: "Không thể kết nối đến server",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Result<T>> {
    try {
      const url = buildUrl(endpoint, options?.params, options?.pathParams);
      const token = getAccessToken();

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });

      return handleResponse<T>(response);
    } catch (error) {
      return err({
        message: "Không thể kết nối đến server",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<Result<T>> {
    try {
      const url = buildUrl(endpoint, options?.params, options?.pathParams);
      const token = getAccessToken();

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      });

      // DELETE thường trả 204 No Content
      if (response.status === 204) {
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
}

/**
 * API client instance
 */
export const apiClient = new ApiClient();
