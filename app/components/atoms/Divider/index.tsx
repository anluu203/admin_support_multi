import { cn } from "@/app/utils/cn";

/**
 * Hướng của Divider
 */
type DividerOrientation = "horizontal" | "vertical";

/**
 * Props cho Divider component
 */
export interface DividerProps {
  /** Hướng hiển thị (mặc định: 'horizontal') */
  orientation?: DividerOrientation;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Divider - Component đường phân cách
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider orientation="vertical" />
 * ```
 */
export function Divider({
  orientation = "horizontal",
  className,
  "data-testid": dataTestId,
}: DividerProps) {
  return (
    <div
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      data-testid={dataTestId}
    />
  );
}
