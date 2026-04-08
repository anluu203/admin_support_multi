import { Suspense } from "react";
import { PermissionManagement } from "@/app/features/phan-quyen/components/PermissionManagement";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý phân quyền | Chat Multi Support",
  description: "Quản trị thành viên, phân quyền và trạng thái hoạt động trong hệ thống",
};

/**
 * PermissionPage - Trang quản lý phân quyền người dùng
 */
export default function PermissionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500 h-screen flex items-center justify-center">
          Đang tải trang quản lý...
        </div>
      }
    >
      <PermissionManagement />
    </Suspense>
  );
}
