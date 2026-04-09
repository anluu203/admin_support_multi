import { CustomLink } from "@/app/components/molecules/CustomLink";
import { cn } from "@/app/lib/utils/cn";import { ChevronRight } from "lucide-react";

/**
 * Item cho Breadcrumb
 */
export interface BreadcrumbItem {
  /** Nhãn hiển thị */
  label: string;
  /** URL (không có = item hiện tại) */
  href?: string;
}

/**
 * Props cho Breadcrumb component
 */
export interface BreadcrumbProps {
  /** Danh sách items */
  items: BreadcrumbItem[];
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Breadcrumb - Component breadcrumb navigation
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Trang chủ', href: '/' },
 *     { label: 'Sản phẩm', href: '/products' },
 *     { label: 'Chi tiết' }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  className,
  "data-testid": dataTestId,
}: BreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center gap-2 text-sm", className)}
      aria-label="Breadcrumb"
      data-testid={dataTestId}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-text-muted" />
          )}
          {item.href ? (
            <CustomLink href={item.href} className="text-text-muted hover:text-text">
              {item.label}
            </CustomLink>
          ) : (
            <span className="text-text font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
