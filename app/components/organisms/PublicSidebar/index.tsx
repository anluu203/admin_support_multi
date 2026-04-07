/**
 * PublicSidebar component props
 */
interface PublicSidebarProps {
  /**
   * Slogan hoặc description
   */
  slogan?: string;
  /**
   * Additional description text
   */
  description?: string;
}

/**
 * PublicSidebar - Side panel cho public auth pages
 *
 * Hiển thị logo, slogan, và background gradient đẹp mắt
 * Chỉ visible trên desktop, ẩn trên mobile
 *
 * @example
 * ```tsx
 * <PublicSidebar
 *   slogan="Quản lý hỗ trợ khách hàng"
 *   description="Giải pháp toàn diện cho team support"
 * />
 * ```
 */
export default function PublicSidebar({
  slogan = "Quản lý hỗ trợ khách hàng đa kênh",
  description = "Giải pháp toàn diện để kết nối, trò chuyện và hỗ trợ khách hàng của bạn từ một nơi duy nhất.",
}: PublicSidebarProps) {
  return (
    <div className="hidden md:flex flex-col justify-between bg-linear-to-br from-primary/90 to-primary/70 p-12 text-white">
      {/* Top Section - Logo */}
      <div>
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-2xl backdrop-blur-sm">
              💬
            </div>
            <span className="text-2xl font-bold">Chat Multi Support</span>
          </div>

          {/* Divider */}
          <div className="h-1 w-16 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Middle Section - Content */}
      <div className="space-y-6">
        {/* Slogan */}
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">{slogan}</h2>
          <p className="text-lg text-white/80 leading-relaxed">{description}</p>
        </div>

        {/* Features List */}
        <div className="space-y-3 pt-6">
          {[
            "Quản lý tin nhắn từ nhiều kênh",
            "Realtime notification & analytics",
            "Team collaboration tools",
            "Advanced routing & automation",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm font-bold">✓</span>
              </div>
              <span className="text-white/90">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Footer */}
      <div className="space-y-2 border-t border-white/20 pt-8">
        <p className="text-sm text-white/70">Bắt đầu ngay hôm nay</p>
        <p className="text-xs text-white/50">© 2026 Chat Multi Support. All rights reserved.</p>
      </div>
    </div>
  );
}
