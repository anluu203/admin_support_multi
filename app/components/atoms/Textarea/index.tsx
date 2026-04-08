"use client";

import { cn } from "@/app/lib/utils/cn";import { forwardRef } from "react";

/**
 * Props cho Textarea component
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Thông báo lỗi */
  error?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Textarea - Component textarea field
 *
 * @example
 * ```tsx
 * <Textarea
 *   rows={4}
 *   placeholder="Nhập ghi chú..."
 *   error={errors.note}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, "data-testid": dataTestId, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
          "placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-vertical",
          error && "border-error focus:ring-error",
          className
        )}
        data-testid={dataTestId}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
