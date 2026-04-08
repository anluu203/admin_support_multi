"use client";

import { cn } from "@/app/lib/utils/cn";import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

/**
 * Option cho Select
 */
export interface SelectOption {
  /** Giá trị */
  value: string;
  /** Nhãn hiển thị */
  label: string;
  /** Disabled */
  disabled?: boolean;
}

/**
 * Props cho Select component
 */
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  /** Danh sách options */
  options: SelectOption[];
  /** Placeholder */
  placeholder?: string;
  /** Thông báo lỗi */
  error?: string;
  /** Callback khi thay đổi */
  onChange?: (value: string) => void;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Select - Component dropdown select
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 *   placeholder="Chọn một option"
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      error,
      onChange,
      className,
      "data-testid": dataTestId,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:ring-error",
            className
          )}
          onChange={(e) => onChange?.(e.target.value)}
          data-testid={dataTestId}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    );
  }
);

Select.displayName = "Select";
