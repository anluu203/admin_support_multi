import { cn } from "@/app/lib/utils/cn";
/**
 * Heading level
 */
type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Heading size
 */
type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Heading color
 */
type HeadingColor = "default" | "primary" | "secondary" | "muted";

/**
 * Heading component props
 */
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level (semantic HTML)
   * @default "h2"
   */
  level?: HeadingLevel;
  /**
   * Heading size (visual size, independent of level)
   * @default "lg"
   */
  size?: HeadingSize;
  /**
   * Text color
   * @default "default"
   */
  color?: HeadingColor;
  /**
   * Content
   */
  children: React.ReactNode;
}

/**
 * Size mapping
 */
const sizeMap: Record<HeadingSize, string> = {
  xs: "text-lg",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  "2xl": "text-5xl",
};

/**
 * Color mapping
 */
const colorMap: Record<HeadingColor, string> = {
  default: "text-slate-900",
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-slate-600",
};

/**
 * Heading - Semantic heading component
 *
 * Hiển thị heading với size và màu sắc tùy chỉnh
 *
 * @example
 * ```tsx
 * <Heading level="h1" size="2xl" color="primary">
 *   Welcome to Chat Multi Support
 * </Heading>
 * ```
 */
export default function Heading({
  level = "h2",
  size = "lg",
  color = "default",
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = level;

  return (
    <Component
      className={cn(
        "font-bold leading-tight tracking-tight",
        sizeMap[size],
        colorMap[color],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
