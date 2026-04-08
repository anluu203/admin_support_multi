"use client";

import { cn } from "@/app/lib/utils/cn";import { forwardRef, useId } from "react";

/**
 * Props cho Switch component
 */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Nhãn hiển thị */
  label?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Switch - Component toggle switch
 *
 * @example
 * ```tsx
 * <Switch
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 *   label="Kích hoạt thông báo"
 * />
 * ```
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, id, "data-testid": dataTestId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `switch-${generatedId}`;

    return (
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="relative inline-block h-6 w-11 cursor-pointer"
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer sr-only"
            data-testid={dataTestId}
            {...props}
          />
          <div
            className={cn(
              "h-6 w-11 rounded-full bg-text-muted transition-colors",
              "peer-checked:bg-primary",
              "peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            )}
          />
          <div
            className={cn(
              "absolute left-1 top-1 h-4 w-4 rounded-full bg-text-surface transition-transform",
              "peer-checked:translate-x-5"
            )}
          />
        </label>
        {label && (
          <label
            htmlFor={inputId}
            className="cursor-pointer select-none text-sm text-text"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
