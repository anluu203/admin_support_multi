"use client";

import { cn } from "@/app/utils/cn";
import { useEffect, useRef, useState } from "react";

/**
 * Item cho Dropdown
 */
export interface DropdownItem {
  /** ID duy nhất */
  id: string;
  /** Nhãn hiển thị */
  label: string;
  /** Icon (optional) */
  icon?: React.ReactNode;
  /** Disabled */
  disabled?: boolean;
  /** Callback khi click */
  onClick?: () => void;
}

/**
 * Props cho Dropdown component
 */
export interface DropdownProps {
  /** Element trigger */
  trigger: React.ReactNode;
  /** Danh sách items */
  items: DropdownItem[];
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Dropdown - Component dropdown menu
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button>Hành động</Button>}
 *   items={[
 *     { id: 'edit', label: 'Sửa', onClick: () => {} },
 *     { id: 'delete', label: 'Xóa', onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export function Dropdown({
  trigger,
  items,
  className,
  "data-testid": dataTestId,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn("relative inline-block", className)}
      data-testid={dataTestId}
    >
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-border bg-background-surface shadow-lg">
          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                  item.disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-background-muted"
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
