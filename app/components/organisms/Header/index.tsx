"use client";

import { Avatar } from "@/app/components/atoms/Avatar";
import { Dropdown, type DropdownItem } from "@/app/components/molecules/Dropdown";
import { cn } from "@/app/utils/cn";
import { Bell } from "lucide-react";

/**
 * Thông tin user cho Header
 */
export interface HeaderUser {
  /** Tên */
  name: string;
  /** Email */
  email?: string;
  /** Avatar URL */
  avatar?: string;
}

/**
 * Props cho Header component
 */
export interface HeaderProps {
  /** Tiêu đề */
  title?: string;
  /** Thông tin user */
  user?: HeaderUser;
  /** Danh sách actions cho user menu */
  userMenuActions?: DropdownItem[];
  /** Actions bổ sung */
  actions?: React.ReactNode;
  /** Số thông báo */
  notificationCount?: number;
  /** Callback khi click thông báo */
  onNotificationClick?: () => void;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Header - Component admin header
 *
 * @example
 * ```tsx
 * <Header
 *   title="Dashboard"
 *   user={{ name: 'John Doe', email: 'john@example.com' }}
 *   userMenuActions={[
 *     { id: 'profile', label: 'Hồ sơ', onClick: () => {} },
 *     { id: 'logout', label: 'Đăng xuất', onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export function Header({
  title,
  user,
  userMenuActions,
  actions,
  notificationCount,
  onNotificationClick,
  className,
  "data-testid": dataTestId,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-border bg-background-surface px-6",
        className
      )}
      data-testid={dataTestId}
    >
      {/* Title */}
      {title && <h1 className="text-xl font-semibold text-text">{title}</h1>}

      <div className="flex items-center gap-4">
        {/* Actions */}
        {actions}

        {/* Notifications */}
        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            className="relative rounded-md p-2 hover:bg-background-muted"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            {notificationCount !== undefined && notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-xs text-text-surface">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        )}

        {/* User Menu */}
        {user && (
          <Dropdown
            trigger={
              <button className="flex items-center gap-3 rounded-md p-2 hover:bg-background-muted">
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  fallback={user.name.charAt(0).toUpperCase()}
                  size="sm"
                />
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-text">{user.name}</p>
                  {user.email && (
                    <p className="text-xs text-text-muted">{user.email}</p>
                  )}
                </div>
              </button>
            }
            items={userMenuActions || []}
          />
        )}
      </div>
    </header>
  );
}
