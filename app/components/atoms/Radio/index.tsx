"use client";

import { cn } from "@/app/lib/utils/cn";import { forwardRef, useId } from "react";

/**
 * Props cho Radio component
 */
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Nhãn hiển thị */
  label?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Radio - Component radio button
 *
 * @example
 * ```tsx
 * <Radio
 *   name="payment"
 *   value="card"
 *   checked={payment === 'card'}
 *   onChange={(e) => setPayment(e.target.value)}
 *   label="Thẻ tín dụng"
 * />
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, "data-testid": dataTestId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `radio-${generatedId}`;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={cn(
            "h-5 w-5 cursor-pointer border-2 border-border text-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          data-testid={dataTestId}
          {...props}
        />
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

Radio.displayName = "Radio";
