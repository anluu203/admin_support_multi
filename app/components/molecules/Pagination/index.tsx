"use client";

import { IconButton } from "@/app/components/molecules/IconButton";
import { cn } from "@/app/lib/utils/cn";import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props cho Pagination component
 */
export interface PaginationProps {
  /** Trang hiện tại (bắt đầu từ 1) */
  currentPage: number;
  /** Tổng số trang */
  totalPages: number;
  /** Callback khi thay đổi trang */
  onPageChange: (page: number) => void;
  /** Số trang hiển thị xung quanh trang hiện tại */
  siblingCount?: number;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Pagination - Component phân trang
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  "data-testid": dataTestId,
}: PaginationProps) {
  const generatePages = () => {
    const pages: (number | string)[] = [];
    const showLeftDots = currentPage > siblingCount + 2;
    const showRightDots = currentPage < totalPages - siblingCount - 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (showLeftDots) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - siblingCount);
      const end = Math.min(totalPages - 1, currentPage + siblingCount);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (showRightDots) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <nav
      className={cn("flex items-center gap-2", className)}
      aria-label="Pagination"
      data-testid={dataTestId}
    >
      <IconButton
        icon={ChevronLeft}
        aria-label="Trang trước"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`dots-${index}`} className="px-2 text-text-muted">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              "h-10 w-10 rounded-md text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isActive
                ? "bg-primary text-text-surface"
                : "text-text hover:bg-background-muted"
            )}
          >
            {pageNum}
          </button>
        );
      })}

      <IconButton
        icon={ChevronRight}
        aria-label="Trang sau"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </nav>
  );
}
