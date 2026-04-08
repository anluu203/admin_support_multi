"use client";

import { cn } from "@/app/lib/utils/cn";import { type LucideIcon } from "lucide-react";

/**
 * Props cho ButtonWithIcon component
 */
export interface ButtonWithIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon component */
  icon: LucideIcon;
  /** Vị trí icon (mặc định: 'left') */
  iconPosition?: "left" | "right";
  /** Kích thước (mặc định: 'md') */
  size?: "sm" | "md" | "lg";
  /** Biến thể (mặc định: 'primary') */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "danger";
  /** Trạng thái loading */
  isLoading?: boolean;
  /** Mở rộng full width */
  fullWidth?: boolean;
  /** Test ID */
  "data-testid"?: string;
}

const variantClasses = {
  primary:
    "bg-primary text-text-surface hover:bg-primary-hover disabled:bg-text-muted",
  secondary:
    "bg-secondary text-text-surface hover:bg-secondary-hover disabled:bg-text-muted",
  outline:
    "border-2 border-primary text-primary hover:bg-primary-light disabled:border-text-muted disabled:text-text-muted",
  ghost: "text-primary hover:bg-primary-light disabled:text-text-muted",
  link: "text-primary underline-offset-4 hover:underline disabled:text-text-muted",
  danger:
    "bg-error text-text-surface hover:bg-error/90 disabled:bg-text-muted",
};

const sizeClasses = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-base gap-2",
  lg: "h-12 px-6 text-lg gap-2.5",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

/**
 * ButtonWithIcon - Component button có icon
 *
 * @example
 * ```tsx
 * <ButtonWithIcon
 *   icon={LogIn}
 *   iconPosition="left"
 *   variant="primary"
 * >
 *   Đăng nhập
 * </ButtonWithIcon>
 * ```
 */
export default function ButtonWithIcon({
  children,
  icon: Icon,
  iconPosition = "left",
  size = "md",
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  "data-testid": dataTestId,
  ...props
}: ButtonWithIconProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      data-testid={dataTestId}
      {...props}
    >
      {iconPosition === "left" && (
        <Icon className={cn(iconSizeClasses[size], isLoading && "animate-spin")} />
      )}
      {children}
      {iconPosition === "right" && (
        <Icon className={cn(iconSizeClasses[size], isLoading && "animate-spin")} />
      )}
    </button>
  );
}
