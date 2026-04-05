"use client";

import { cn } from "@/app/utils/cn";
import { type LucideIcon } from "lucide-react";

/**
 * Props cho IconButton component
 */
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon component */
  icon: LucideIcon;
  /** Kích thước (mặc định: 'md') */
  size?: "sm" | "md" | "lg";
  /** Biến thể (mặc định: 'ghost') */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Aria label (bắt buộc cho accessibility) */
  "aria-label": string;
  /** Test ID */
  "data-testid"?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const variantClasses = {
  primary: "bg-primary text-text-surface hover:bg-primary-hover",
  secondary: "bg-secondary text-text-surface hover:bg-secondary-hover",
  ghost: "text-text hover:bg-background-muted",
  danger: "text-error hover:bg-error-light",
};

/**
 * IconButton - Component button chỉ có icon
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={Trash}
 *   aria-label="Xóa"
 *   variant="danger"
 * />
 * ```
 */
export function IconButton({
  icon: Icon,
  size = "md",
  variant = "ghost",
  className,
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      {...props}
    >
      <Icon className={iconSizeClasses[size]} />
    </button>
  );
}
