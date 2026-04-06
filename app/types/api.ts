/**
 * API Response từ Backend (wrapper Result<T>)
 */
export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Paginated Response từ Backend
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
