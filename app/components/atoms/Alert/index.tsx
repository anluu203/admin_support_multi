import { cn } from "@/app/lib/utils/cn";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Biến thể Alert
 */
type AlertVariant = "success" | "warning" | "error" | "info";

/**
 * Props cho Alert component
 */
export interface AlertProps {
  /** Nội dung alert */
  children: React.ReactNode;
  /** Biến thể hiển thị */
  variant: AlertVariant;
  /** Tiêu đề */
  title?: string;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  success: {
    bg: "bg-success-light",
    border: "border-success/20",
    text: "text-success",
    icon: CheckCircle2,
  },
  warning: {
    bg: "bg-warning-light",
    border: "border-warning/20",
    text: "text-warning",
    icon: AlertCircle,
  },
  error: {
    bg: "bg-error-light",
    border: "border-error/20",
    text: "text-error",
    icon: XCircle,
  },
  info: {
    bg: "bg-info-light",
    border: "border-info/20",
    text: "text-info",
    icon: Info,
  },
};

/**
 * Alert - Component thông báo inline
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="Thành công">
 *   Dữ liệu đã được lưu thành công!
 * </Alert>
 * ```
 */
export  function Alert({
  children,
  variant,
  title,
  className,
  "data-testid": dataTestId,
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        config.bg,
        config.border,
        className
      )}
      data-testid={dataTestId}
    >
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 shrink-0", config.text)} />
        <div className="flex-1">
          {title && (
            <h5 className={cn("mb-1 font-medium", config.text)}>{title}</h5>
          )}
          <div className="text-sm text-text">{children}</div>
        </div>
      </div>
    </div>
  );
}
