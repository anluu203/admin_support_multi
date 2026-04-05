"use client";

import { Button } from "@/app/components/atoms/Button";
import { Modal } from "@/app/components/molecules/Modal";

/**
 * Props cho ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** Hiển thị/ẩn dialog */
  open: boolean;
  /** Callback khi đóng */
  onClose: () => void;
  /** Callback khi confirm */
  onConfirm: () => void;
  /** Tiêu đề */
  title?: string;
  /** Nội dung */
  message: string;
  /** Text nút confirm (mặc định: 'Xác nhận') */
  confirmText?: string;
  /** Text nút cancel (mặc định: 'Hủy') */
  cancelText?: string;
  /** Biến thể nút confirm (mặc định: 'primary') */
  variant?: "primary" | "danger";
  /** Trạng thái loading */
  isLoading?: boolean;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * ConfirmDialog - Component dialog xác nhận
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Xác nhận xóa"
 *   message="Bạn có chắc muốn xóa người dùng này?"
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "primary",
  isLoading = false,
  "data-testid": dataTestId,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      data-testid={dataTestId}
    >
      <div className="space-y-4">
        <p className="text-sm text-text">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
