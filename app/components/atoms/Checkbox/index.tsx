"use client";

import { cn } from "@/app/utils/cn";
import { Check } from "lucide-react";
import { forwardRef, useId } from "react";

/**
 * Props cho Checkbox component
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Nhãn hiển thị */
  label?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Checkbox - Component checkbox
 *
 * @example
 * ```tsx
 * <Checkbox
 *   checked={agreed}
 *   onChange={(e) => setAgreed(e.target.checked)}
 *   label="Tôi đồng ý với điều khoản"
 * />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, "data-testid": dataTestId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `checkbox-${generatedId}`;

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-border",
              "checked:border-primary checked:bg-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            data-testid={dataTestId}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-text-surface opacity-0 peer-checked:opacity-100" />
        </div>
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

Checkbox.displayName = "Checkbox";
