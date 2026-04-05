"use client";

import { cn } from "@/app/utils/cn";
import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * Props cho Modal component
 */
export interface ModalProps {
  /** Hiển thị/ẩn modal */
  open: boolean;
  /** Callback khi đóng modal */
  onClose: () => void;
  /** Nội dung modal */
  children: React.ReactNode;
  /** Tiêu đề modal */
  title?: string;
  /** Kích thước modal (mặc định: 'md') */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Aria label cho accessibility */
  ariaLabel?: string;
  /** Test ID */
  "data-testid"?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full m-4",
};

/**
 * Modal - Component modal/dialog
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Xác nhận">
 *   <p>Bạn có chắc muốn xóa?</p>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  children,
  title,
  size = "md",
  ariaLabel,
  "data-testid": dataTestId,
}: ModalProps) {
  useEffect(() => {
    // Khi modal mở, khóa cuộn trang
    if (open) {  
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid={dataTestId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full rounded-lg bg-background-surface shadow-lg",
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-xl font-semibold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-background-muted"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
