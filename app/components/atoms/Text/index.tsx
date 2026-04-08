import { cn } from "@/app/lib/utils/cn";
/**
 * Kích thước văn bản
 */
type TextSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Độ đậm văn bản
 */
type TextWeight = "normal" | "medium" | "bold";

/**
 * Màu sắc văn bản
 */
type TextColor =
  | "default"
  | "primary"
  | "secondary"
  | "surface"
  | "muted"
  | "subtle";

/**
 * Props cho Text component
 */
export interface TextProps {
  /** Nội dung văn bản */
  children: React.ReactNode;
  /** Kích thước văn bản (mặc định: 'md') */
  size?: TextSize;
  /** Độ đậm văn bản (mặc định: 'normal') */
  weight?: TextWeight;
  /** Màu sắc văn bản (mặc định: 'default') */
  color?: TextColor;
  /** Thẻ HTML để render (mặc định: 'p') */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

const sizeClasses: Record<TextSize, string> = {
  xxs: "text-[0.625rem]",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const weightClasses: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

const colorClasses: Record<TextColor, string> = {
  default: "text-text",
  primary: "text-primary",
  secondary: "text-secondary",
  surface: "text-text-surface",
  muted: "text-text-muted",
  subtle: "text-text-subtle",
};

/**
 * Text - Component hiển thị văn bản
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="bold" color="primary">
 *   Tiêu đề chính
 * </Text>
 * ```
 */
export function Text({
  children,
  size = "md",
  weight = "normal",
  color = "default",
  as: Component = "p",
  className,
  "data-testid": dataTestId,
}: TextProps) {
  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
      data-testid={dataTestId}
    >
      {children}
    </Component>
  );
}
