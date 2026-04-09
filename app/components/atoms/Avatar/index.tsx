"use client";

import { cn } from "@/app/lib/utils/cn";
import { User } from "lucide-react";
import { useState } from "react";

/**
 * Kích thước Avatar
 */
type AvatarSize = "sm" | "md" | "lg" | "xl";

/**
 * Props cho Avatar component
 */
export interface AvatarProps {
  /** URL hình ảnh */
  src?: string;
  /** Alt text */
  alt?: string;
  /** Văn bản hiển thị khi không có hình (fallback) */
  fallback?: string;
  /** Kích thước avatar (mặc định: 'md') */
  size?: AvatarSize;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

/**
 * Avatar - Component hiển thị avatar
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="User" size="lg" />
 * <Avatar fallback="AB" />
 * ```
 */
export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
  "data-testid": dataTestId,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-background-muted",
        sizeClasses[size],
        className
      )}
      data-testid={dataTestId}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        <span className="font-medium text-text-muted">{fallback}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-text-muted" />
      )}
    </div>
  );
}
