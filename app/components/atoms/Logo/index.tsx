import { cn } from "@/app/lib/utils/cn";
/**
 * Logo size variants
 */
type LogoSize = "sm" | "md" | "lg";

/**
 * Logo component props
 */
interface LogoProps {
  /**
   * Logo size
   * @default "md"
   */
  size?: LogoSize;
  /**
   * Logo text/brand name
   * @default "Chat Multi Support"
   */
  text?: string;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * Size mapping
 */
const sizeMap: Record<LogoSize, string> = {
  sm: "text-lg font-bold",
  md: "text-2xl font-bold",
  lg: "text-4xl font-bold",
};

/**
 * Logo - Brand logo component
 *
 * Hiển thị logo công ty với text branding
 *
 * @example
 * ```tsx
 * <Logo size="lg" text="Chat Multi Support" />
 * ```
 */
export default function Logo({ size = "md", text = "Chat Multi Support", className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Mark */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold">
        💬
      </div>

      {/* Logo Text */}
      <span className={cn(sizeMap[size], "text-slate-900")}>
        {text}
      </span>
    </div>
  );
}
