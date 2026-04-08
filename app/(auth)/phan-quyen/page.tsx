import { PermissionManagement } from "@/app/features/phan-quyen/components/PermissionManagement";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý phân quyền | Chat Multi Support",
  description:
    "Quản trị thành viên, phân quyền và trạng thái hoạt động trong hệ thống",
};

export default function PermissionPage() {
  return <PermissionManagement />;
}
