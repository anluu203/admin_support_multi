"use client";

import { PublicAuthLayout } from "@/app/components/organisms";

/**
 * Public Auth Layout - Layout cho public authentication pages
 *
 * Hiển thị split-screen layout với sidebar
 * Dùng cho login, register, forgot password, etc.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicAuthLayout
      slogan="Quản lý hỗ trợ khách hàng đa kênh"
      sidebarDescription="Giải pháp toàn diện để kết nối, trò chuyện và hỗ trợ khách hàng của bạn từ một nơi duy nhất."
    >
      {children}
    </PublicAuthLayout>
  );
}
