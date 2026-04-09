"use client";

import { Input } from "@/app/components/atoms/Input";
import { cn } from "@/app/lib/utils/cn";import { Calendar } from "lucide-react";
import { forwardRef } from "react";

/**
 * Props cho DatePicker component
 */
export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Thông báo lỗi */
  error?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * DatePicker - Component date picker
 *
 * @example
 * ```tsx
 * <DatePicker
 *   value={date}
 *   onChange={(e) => setDate(e.target.value)}
 *   error={errors.date}
 * />
 * ```
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, "data-testid": dataTestId, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type="date"
          className={cn("pr-10", className)}
          error={error}
          data-testid={dataTestId}
          {...props}
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
