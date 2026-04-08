import { cn } from "@/app/lib/utils/cn";import { Loader2 } from "lucide-react";

/**
 * Kích thước Spinner
 */
type SpinnerSize = "sm" | "md" | "lg" | "xl";

/**
 * Props cho Spinner component
 */
export interface SpinnerProps {
  /** Kích thước spinner (mặc định: 'md') */
  size?: SpinnerSize;
  /** Màu sắc (mặc định: 'primary') */
  color?: "primary" | "secondary" | "muted";
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-text-muted",
};

/**
 * Spinner - Component loading spinner
 *
 * @example
 * ```tsx
 * <Spinner size="lg" />
 * ```
 */
export function Spinner({
  size = "md",
  color = "primary",
  className,
  "data-testid": dataTestId,
}: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      data-testid={dataTestId}
    />
  );
}
