"use client";

import { useRouter } from "next/navigation";
import ProtectedHeader from "../ProtectedHeader";
import ProtectedSidebar from "../ProtectedSidebar";

/**
 * ProtectedAuthLayout component props
 */
interface ProtectedAuthLayoutProps {
  /**
   * Layout children (page content)
   */
  children: React.ReactNode;
  /**
   * Page title to display in header
   */
  pageTitle?: string;
  /**
   * User name
   */
  userName?: string;
  /**
   * User email
   */
  userEmail?: string;
  /**
   * User avatar URL
   */
  userAvatar?: string;
  /**
   * Current active path for sidebar navigation
   */
  activePath?: string;
}

/**
 * ProtectedAuthLayout - Layout cho protected pages
 *
 * Hiển thị:
 * - Left Sidebar: Navigation + User profile + Logout
 * - Top Header: Page title + Notifications + Theme toggle
 * - Main Content: Page children
 *
 * Layout structure:
 * ```
 * ┌─────────────────────────────────────┐
 * │         ProtectedHeader             │
 * ├────────────┬────────────────────────┤
 * │            │                        │
 * │ Sidebar    │   Main Content         │
 * │            │   (children)           │
 * │            │                        │
 * └────────────┴────────────────────────┘
 * ```
 *
 * @example
 * ```tsx
 * <ProtectedAuthLayout
 *   pageTitle="Dashboard"
 *   userName="John Doe"
 *   userEmail="john@example.com"
 * >
 *   <DashboardContent />
 * </ProtectedAuthLayout>
 * ```
 */
export default function ProtectedAuthLayout({
  children,
  pageTitle = "Dashboard",
  userName = "Agent Admin",
  userEmail = "admin@example.com",
  userAvatar,
  activePath = "/dashboard",
}: ProtectedAuthLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Remove auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Redirect to login
    router.push("/login");
  };

  return (
    <div className="ml-64 flex min-h-screen flex-col bg-background-muted">
      {/* Header - Sticky at top, offset for sidebar */}
      <ProtectedHeader title={pageTitle} userName={userName} />

      {/* Sidebar - Fixed (positioned absolutely) */}
      <ProtectedSidebar
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        onLogout={handleLogout}
        activePath={activePath}
      />

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
