"use client";

import { cn } from "@/app/utils/cn";
import { forwardRef } from "react";

/**
 * Props cho Input component
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Thông báo lỗi */
  error?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Input - Component input field
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   placeholder="Email của bạn"
 *   error={errors.email}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, "data-testid": dataTestId, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
          "placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-error focus:ring-error",
          className
        )}
        data-testid={dataTestId}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
