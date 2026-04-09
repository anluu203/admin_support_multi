import { Avatar, Text } from "@/app/components";
import { Bell, Moon, Sun } from "lucide-react";

/**
 * ProtectedHeader component props
 */
interface ProtectedHeaderProps {
  /**
   * Page title to display in header
   */
  title?: string;
  /**
   * User name
   */
  userName?: string;
  /**
   * User avatar URL
   */
  userAvatar?: string;
  /**
   * Theme mode (light/dark)
   */
  themeMode?: "light" | "dark";
  /**
   * Callback when theme toggle is clicked
   */
  onThemeToggle?: () => void;
}

/**
 * ProtectedHeader - Top header cho protected pages
 *
 * Hiển thị page title, notifications, user profile, theme toggle
 * Sticky header ở top
 *
 * @example
 * ```tsx
 * <ProtectedHeader
 *   title="Dashboard"
 *   userName="John Doe"
 *   themeMode="light"
 *   onThemeToggle={toggleTheme}
 * />
 * ```
 */
export default function ProtectedHeader({
  title = "Dashboard",
  userName = "Agent Admin",
  userAvatar,
  themeMode = "light",
  onThemeToggle,
}: ProtectedHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-6 py-4">
      {/* Title */}
      <div>
        <Text size="2xl" weight="bold" color="default">
          {title}
        </Text>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button 
          className="relative rounded-lg p-2 text-slate-600 hover:bg-background-muted"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-background-muted"
          aria-label="Toggle theme"
        >
          {themeMode === "light" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <Avatar
            src={userAvatar}
            alt={userName}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
}
