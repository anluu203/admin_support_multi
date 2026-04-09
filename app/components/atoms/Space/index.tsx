import { cn } from "@/app/lib/utils/cn";
/**
 * Props cho Space component
 */
export interface SpaceProps {
  /** Chiều cao (Tailwind spacing scale) */
  height?: number | string;
  /** Chiều rộng (Tailwind spacing scale) */
  width?: number | string;
  /** CSS class bổ sung */
  className?: string;
}

/**
 * Space - Component tạo khoảng cách
 *
 * @example
 * ```tsx
 * <Space height={4} />
 * <Space width={8} />
 * ```
 */
export function Space({ height, width, className }: SpaceProps) {
  const heightClass = height ? `h-${height}` : undefined;
  const widthClass = width ? `w-${width}` : undefined;

  return <div className={cn(heightClass, widthClass, className)} />;
}
