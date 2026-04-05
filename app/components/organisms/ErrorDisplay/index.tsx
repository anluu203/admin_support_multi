import { Alert } from "@/app/components/atoms/Alert";
import { Button } from "@/app/components/atoms/Button";
import { cn } from "@/app/utils/cn";

/**
 * Error object (theo Result type)
 */
export interface ErrorObject {
  /** Mã lỗi */
  code?: string;
  /** Thông báo lỗi */
  message: string;
  /** Chi tiết lỗi */
  details?: string;
}

/**
 * Props cho ErrorDisplay component
 */
export interface ErrorDisplayProps {
  /** Error object */
  error?: ErrorObject | null;
  /** Callback retry */
  onRetry?: () => void;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * ErrorDisplay - Component hiển thị lỗi (Result type)
 *
 * @example
 * ```tsx
 * if (isError(result)) {
 *   return <ErrorDisplay error={result.error} onRetry={refetch} />;
 * }
 * ```
 */
export function ErrorDisplay({
  error,
  onRetry,
  className,
  "data-testid": dataTestId,
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert
      variant="error"
      title={error.code ? `Lỗi ${error.code}` : "Đã xảy ra lỗi"}
      className={cn(className)}
      data-testid={dataTestId}
    >
      <p className="mb-2">{error.message}</p>
      {error.details && (
        <p className="mb-4 text-xs text-text-muted">{error.details}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </Alert>
  );
}
