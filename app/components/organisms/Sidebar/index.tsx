"use client";

import { CustomLink } from "@/app/components/molecules/CustomLink";
import { cn } from "@/app/utils/cn";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { useState } from "react";

/**
 * Item cho Sidebar
 */
export interface SidebarItem {
  /** ID duy nhất */
  id: string;
  /** Nhãn hiển thị */
  label: string;
  /** Icon */
  icon: LucideIcon;
  /** URL */
  href: string;
  /** Badge (số thông báo) */
  badge?: number;
}

/**
 * Props cho Sidebar component
 */
export interface SidebarProps {
  /** Danh sách items */
  items: SidebarItem[];
  /** Item đang active */
  activeItem?: string;
  /** Logo/branding */
  logo?: React.ReactNode;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Sidebar - Component admin sidebar
 *
 * @example
 * ```tsx
 * <Sidebar
 *   items={[
 *     { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
 *     { id: 'users', label: 'Users', icon: Users, href: '/users', badge: 5 },
 *   ]}
 *   activeItem="dashboard"
 * />
 * ```
 */
export function Sidebar({
  items,
  activeItem,
  logo,
  className,
  "data-testid": dataTestId,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-background-surface transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
      data-testid={dataTestId}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && logo && <div>{logo}</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-md p-2 hover:bg-background-muted",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItem;

            return (
              <li key={item.id}>
                <CustomLink
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-background-muted hover:no-underline",
                    isActive
                      ? "bg-primary text-text-surface hover:bg-primary-hover"
                      : "text-text"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs text-text-surface">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </CustomLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
