import { cn } from "@/app/lib/utils/cn";
/**
 * Biến thể Badge
 */
type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

/**
 * Kích thước Badge
 */
type BadgeSize = "sm" | "md" | "lg";

/**
 * Props cho Badge component
 */
export interface BadgeProps {
  /** Nội dung badge */
  children: React.ReactNode;
  /** Biến thể hiển thị (mặc định: 'default') */
  variant?: BadgeVariant;
  /** Kích thước badge (mặc định: 'md') */
  size?: BadgeSize;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-light text-success border-success/20",
  warning: "bg-warning-light text-warning border-warning/20",
  error: "bg-error-light text-error border-error/20",
  info: "bg-info-light text-info border-info/20",
  default: "bg-background-muted text-text-muted border-border",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

/**
 * Badge - Component badge/tag
 *
 * @example
 * ```tsx
 * <Badge variant="success">Hoàn thành</Badge>
 * <Badge variant="error" size="sm">Lỗi</Badge>
 * ```
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  "data-testid": dataTestId,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      data-testid={dataTestId}
    >
      {children}
    </span>
  );
}
