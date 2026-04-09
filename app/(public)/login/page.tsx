import { Heading, Text } from "@/app/components";
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <Heading level="h1" size="lg" color="default">
          Đăng nhập
        </Heading>
        <Text color="muted" size="sm">
          Nhập thông tin tài khoản của bạn để tiếp tục
        </Text>
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}
