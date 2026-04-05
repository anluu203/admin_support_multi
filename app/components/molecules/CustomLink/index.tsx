"use client";

import { cn } from "@/app/utils/cn";
import Link from "next/link";

/**
 * Props cho CustomLink component
 */
export interface CustomLinkProps {
  /** URL đích (internal path only) */
  href: string;
  /** Nội dung link */
  children: React.ReactNode;
  /** Kích hoạt animation (mặc định: true) */
  animated?: boolean;
  /** Xóa history stack */
  clearStack?: boolean;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * CustomLink - Component internal link
 *
 * Lưu ý: Dùng thẻ <a> cho external links
 *
 * @example
 * ```tsx
 * <CustomLink href="/settings">Cài đặt</CustomLink>
 * ```
 */
export function CustomLink({
  href,
  children,
  animated = true,
  className,
  "data-testid": dataTestId,
}: CustomLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-primary hover:text-primary-hover",
        animated && "transition-colors duration-200",
        className
      )}
      data-testid={dataTestId}
    >
      {children}
    </Link>
  );
}
