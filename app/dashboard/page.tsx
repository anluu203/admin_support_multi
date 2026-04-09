"use client";

import { Button, Card, Text } from "@/app/components";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * User info from localStorage
 */
interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

/**
 * DashboardPage - User dashboard
 * 
 * Protected by DashboardLayout - auth is already verified
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Layout already checked auth, just load user data
    const userStr = localStorage.getItem("user");
    
    if (userStr) {
      try {
        setUser(JSON.parse(userStr) as User);
      } catch {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    // Xóa tokens và user info
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    router.push("/login");
  };



  return (
    <div className="min-h-screen bg-background-muted px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text size="2xl" weight="bold" className="mb-2">
              Dashboard
            </Text>

          </div>
          <Button variant="outline" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        {/* User Info Card */}
        <Card padding="lg">
          <Text weight="bold" className="mb-4">
            Thông tin tài khoản
          </Text>
          {/* <div className="space-y-3">
            <div className="flex gap-2">
              <Text color="muted" className="w-32">
                ID:
              </Text>
              <Text>{user.id}</Text>
            </div>
            <div className="flex gap-2">
              <Text color="muted" className="w-32">
                Họ tên:
              </Text>
              <Text>{user.fullName}</Text>
            </div>
            <div className="flex gap-2">
              <Text color="muted" className="w-32">
                Username:
              </Text>
              <Text>{user.username}</Text>
            </div>
            <div className="flex gap-2">
              <Text color="muted" className="w-32">
                Email:
              </Text>
              <Text>{user.email}</Text>
            </div>
          </div> */}
        </Card>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card padding="lg">
            <Text weight="bold" className="mb-2">
              📊 Thống kê
            </Text>
            <Text size="sm" color="muted">
              Xem báo cáo và phân tích
            </Text>
          </Card>

          <Card padding="lg">
            <a href="/dashboard/chat" className="block">
              <Text weight="bold" className="mb-2">
                💬 Live Chat
              </Text>
              <Text size="sm" color="muted">
                Quản lý hội thoại realtime &amp; offline
              </Text>
            </a>
          </Card>

          <Card padding="lg">
            <Text weight="bold" className="mb-2">
              ⚙️ Cài đặt
            </Text>
            <Text size="sm" color="muted">
              Tùy chỉnh hệ thống
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
