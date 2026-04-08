"use client";

import { Input, type InputProps } from "@/app/components/atoms/Input";
import { cn } from "@/app/lib/utils/cn";import { type LucideIcon } from "lucide-react";
import { forwardRef } from "react";

/**
 * Props cho InputWithIcon component
 */
export interface InputWithIconProps extends InputProps {
  /** Icon component */
  icon: LucideIcon;
  /** Vị trí icon (mặc định: 'left') */
  iconPosition?: "left" | "right";
}

/**
 * InputWithIcon - Component input có icon
 *
 * @example
 * ```tsx
 * <InputWithIcon
 *   icon={Search}
 *   placeholder="Tìm kiếm..."
 * />
 * ```
 */
export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  (
    { icon: Icon, iconPosition = "left", className, ...props },
    ref
  ) => {
    return (
      <div className="relative">
        {iconPosition === "left" && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        )}
        <Input
          ref={ref}
          className={cn(
            iconPosition === "left" && "pl-10",
            iconPosition === "right" && "pr-10",
            className
          )}
          {...props}
        />
        {iconPosition === "right" && (
          <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";
