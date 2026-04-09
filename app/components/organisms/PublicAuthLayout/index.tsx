import PublicSidebar from "@/app/components/organisms/PublicSidebar";

/**
 * PublicAuthLayout component props
 */
interface PublicAuthLayoutProps {
  /**
   * Layout children (form content)
   */
  children: React.ReactNode;
  /**
   * Optional slogan for sidebar
   */
  slogan?: string;
  /**
   * Optional description for sidebar
   */
  sidebarDescription?: string;
}

/**
 * PublicAuthLayout - Layout template cho public authentication pages
 *
 * Hiển thị split-screen layout trên desktop:
 * - Cột trái: PublicSidebar (background gradient, logo, slogan)
 * - Cột phải: Form content (white background, centered)
 *
 * Trên mobile, chỉ hiển thị form content ở giữa
 *
 * @example
 * ```tsx
 * <PublicAuthLayout slogan="Đăng nhập vào hệ thống">
 *   <LoginForm />
 * </PublicAuthLayout>
 * ```
 */
export default function PublicAuthLayout({
  children,
  slogan,
  sidebarDescription,
}: PublicAuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - Desktop only */}
      <PublicSidebar slogan={slogan} description={sidebarDescription} />

      {/* Main Content - Form Area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Content Container - with shadow on mobile/tablet */}
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-0 md:shadow-none sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
