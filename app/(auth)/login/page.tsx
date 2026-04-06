import { Card, Text } from "@/app/components";
import { LoginForm } from "@/app/features/auth/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Chat Multi Support",
  description: "Đăng nhập vào hệ thống Chat Multi Support",
};

/**
 * LoginPage - Trang đăng nhập
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-muted px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Text size="2xl" weight="bold" className="mb-2">
            Chat Multi Support
          </Text>
          <Text color="muted">Đăng nhập vào tài khoản của bạn</Text>
        </div>

        {/* Login Card */}
        <Card padding="lg">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
