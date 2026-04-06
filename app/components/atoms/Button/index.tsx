"use client";

import { cn } from "@/app/utils/cn";
import { Loader2 } from "lucide-react";

/**
 * Biến thể Button
 */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "danger";

/**
 * Kích thước Button
 */
type ButtonSize = "sm" | "md" | "lg";

/**
 * Props cho Button component
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Biến thể hiển thị:  "primary"| "secondary"| "outline"| "ghost"| "link"| "danger" */
  variant?: ButtonVariant;
  /** Kích thước button (mặc định: 'md') */
  size?: ButtonSize;
  /** Trạng thái loading */
  isLoading?: boolean;
  /** Mở rộng full width */
  fullWidth?: boolean;
  /** Test ID */
  "data-testid"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-surface hover:bg-primary-hover disabled:bg-text-muted",
  secondary:
    "bg-secondary text-text-surface hover:bg-secondary-hover disabled:bg-text-muted",
  outline:
    "border-2 border-primary text-primary hover:bg-primary-light disabled:border-text-muted disabled:text-text-muted",
  ghost: "text-primary hover:bg-primary-light disabled:text-text-muted",
  link: "text-primary underline-offset-4 hover:underline disabled:text-text-muted",
  danger: "bg-error text-text-surface hover:bg-error/90 disabled:bg-text-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

/**
 * Button - Component nút bấm
 *
 * @example
 * ```tsx
 * <Button variant="primary" isLoading={isSubmitting}>
 *   Lưu
 * </Button>
 * ```
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  "data-testid": dataTestId,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      data-testid={dataTestId}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
