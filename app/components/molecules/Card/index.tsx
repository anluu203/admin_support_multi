import { cn } from "@/app/utils/cn";

/**
 * Props cho Card component
 */
export interface CardProps {
  /** Nội dung chính */
  children: React.ReactNode;
  /** Tiêu đề card */
  title?: string;
  /** Mô tả card */
  description?: string;
  /** Nội dung footer */
  footer?: React.ReactNode;
  /** Padding (mặc định: 'md') */
  padding?: "none" | "sm" | "md" | "lg";
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/**
 * Card - Component card container
 *
 * @example
 * ```tsx
 * <Card title="Thông tin" description="Chi tiết người dùng">
 *   <p>Nội dung</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  title,
  description,
  footer,
  padding = "md",
  className,
  "data-testid": dataTestId,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background-surface",
        className
      )}
      data-testid={dataTestId}
    >
      {(title || description) && (
        <div className={cn("border-b border-border", paddingClasses[padding])}>
          {title && (
            <h3 className="text-lg font-semibold text-text">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-text-muted">{description}</p>
          )}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div
          className={cn("border-t border-border", paddingClasses[padding])}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
