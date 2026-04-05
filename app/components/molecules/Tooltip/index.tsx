"use client";

import { cn } from "@/app/utils/cn";
import { useState } from "react";

/**
 * Vị trí Tooltip
 */
type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * Props cho Tooltip component
 */
export interface TooltipProps {
  /** Nội dung tooltip */
  content: string;
  /** Element trigger */
  children: React.ReactElement;
  /** Vị trí hiển thị (mặc định: 'top') */
  placement?: TooltipPlacement;
  /** Test ID */
  "data-testid"?: string;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Tooltip - Component tooltip
 *
 * @example
 * ```tsx
 * <Tooltip content="Thông tin hữu ích">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  "data-testid": dataTestId,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      data-testid={dataTestId}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-text px-2 py-1 text-xs text-text-surface shadow-lg",
            placementClasses[placement]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
