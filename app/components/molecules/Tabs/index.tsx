"use client";

import { cn } from "@/app/utils/cn";

/**
 * Item cho Tabs
 */
export interface TabItem {
  /** ID duy nhất */
  id: string;
  /** Nhãn hiển thị */
  label: string;
  /** Disabled */
  disabled?: boolean;
}

/**
 * Props cho Tabs component
 */
export interface TabsProps {
  /** Danh sách tabs */
  items: TabItem[];
  /** Tab đang active */
  activeTab: string;
  /** Callback khi thay đổi tab */
  onChange: (tabId: string) => void;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Tabs - Component tabs
 *
 * @example
 * ```tsx
 * <Tabs
 *   items={[
 *     { id: 'info', label: 'Thông tin' },
 *     { id: 'settings', label: 'Cài đặt' },
 *   ]}
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
export function Tabs({
  items,
  activeTab,
  onChange,
  className,
  "data-testid": dataTestId,
}: TabsProps) {
  return (
    <div
      className={cn("border-b border-border", className)}
      data-testid={dataTestId}
    >
      <div className="flex gap-4">
        {items.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && onChange(item.id)}
              disabled={item.disabled}
              className={cn(
                "relative px-1 py-3 text-sm font-medium transition-colors",
                "focus:outline-none",
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-text",
                item.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
