import DashboardContainer from "@/app/features/dashboard/components/DashboardContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang Dashboard | Chat Multi Support",
  description:
    "Trang dashboard chính của hệ thống, hiển thị thông tin tổng quan và các chức năng quản lý",
};

export default function DashboardPage() {
  return <DashboardContainer />;
}
