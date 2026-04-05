import { Text } from "@/app/components/atoms/Text";
import { cn } from "@/app/utils/cn";
import { FileQuestion } from "lucide-react";

/**
 * Props cho EmptyState component
 */
export interface EmptyStateProps {
  /** Tiêu đề */
  title?: string;
  /** Mô tả */
  description?: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Action button */
  action?: React.ReactNode;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * EmptyState - Component hiển thị khi không có dữ liệu
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="Không có dữ liệu"
 *   description="Chưa có sản phẩm nào"
 *   action={<Button>Thêm sản phẩm</Button>}
 * />
 * ```
 */
export function EmptyState({
  title = "Không có dữ liệu",
  description,
  icon,
  action,
  className,
  "data-testid": dataTestId,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      data-testid={dataTestId}
    >
      <div className="mb-4 text-text-muted">
        {icon || <FileQuestion className="h-16 w-16" />}
      </div>
      <Text size="lg" weight="medium" className="mb-2">
        {title}
      </Text>
      {description && (
        <Text color="muted" className="mb-6 max-w-md">
          {description}
        </Text>
      )}
      {action}
    </div>
  );
}
