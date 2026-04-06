import { Card, Text } from "@/app/components";
import { RegisterForm } from "@/app/features/auth/components/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký | Chat Multi Support",
  description: "Tạo tài khoản mới trên Chat Multi Support",
};

/**
 * RegisterPage - Trang đăng ký
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-muted px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Text size="2xl" weight="bold" className="mb-2">
            Chat Multi Support
          </Text>
          <Text color="muted">Tạo tài khoản mới</Text>
        </div>

        {/* Register Card */}
        <Card padding="lg">
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}
