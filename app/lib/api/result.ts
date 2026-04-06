/**
 * Result Type - Không throw exceptions, trả về Result<T>
 * 
 * Success: { isSuccess: true, data: T, error: null }
 * Error: { isSuccess: false, data: null, error: ErrorObject }
 */

/**
 * Error object từ API
 */
export interface ApiError {
  /** Mã lỗi */
  code?: string;
  /** Thông báo lỗi */
  message: string;
  /** Chi tiết lỗi */
  details?: string;
}

/**
 * Result type cho success
 */
export interface ResultSuccess<T> {
  isSuccess: true;
  data: T;
  error: null;
}

/**
 * Result type cho error
 */
export interface ResultError {
  isSuccess: false;
  data: null;
  error: ApiError;
}

/**
 * Result type tổng quát
 */
export type Result<T> = ResultSuccess<T> | ResultError;

/**
 * Tạo Result success
 * 
 * @example
 * ```ts
 * return ok({ id: 1, name: "User" });
 * ```
 */
export function ok<T>(data: T): ResultSuccess<T> {
  return {
    isSuccess: true,
    data,
    error: null,
  };
}

/**
 * Tạo Result error
 * 
 * @example
 * ```ts
 * return err({ message: "Không tìm thấy người dùng" });
 * ```
 */
export function err(error: ApiError): ResultError {
  return {
    isSuccess: false,
    data: null,
    error,
  };
}

/**
 * Kiểm tra Result có phải success không
 * 
 * @example
 * ```ts
 * if (isOk(result)) {
 *   console.log(result.data); // Type-safe
 * }
 * ```
 */
export function isOk<T>(result: Result<T>): result is ResultSuccess<T> {
  return result.isSuccess === true;
}

/**
 * Kiểm tra Result có phải error không
 * 
 * @example
 * ```ts
 * if (isError(result)) {
 *   return <ErrorDisplay error={result.error} />;
 * }
 * ```
 */
export function isError<T>(result: Result<T>): result is ResultError {
  return result.isSuccess === false;
}

/**
 * Convert Result sang dạng cho UI (với fallback)
 * 
 * @example
 * ```ts
 * const { data, error } = toViewResult(result, []);
 * return (
 *   <>
 *     {data.map(item => <Item key={item.id} {...item} />)}
 *     <ErrorDisplay error={error} />
 *   </>
 * );
 * ```
 */
export function toViewResult<T>(
  result: Result<T>,
  fallback: T
): { data: T; error: ApiError | null } {
  if (isOk(result)) {
    return { data: result.data, error: null };
  }
  return { data: fallback, error: result.error };
}

/**
 * Pattern matching cho Result
 * 
 * @example
 * ```ts
 * return matchResult(result, {
 *   ok: (data) => <Success data={data} />,
 *   err: (error) => <Error error={error} />,
 * });
 * ```
 */
export function matchResult<T, R>(
  result: Result<T>,
  handlers: {
    ok: (data: T) => R;
    err: (error: ApiError) => R;
  }
): R {
  if (isOk(result)) {
    return handlers.ok(result.data);
  }
  return handlers.err(result.error);
}
