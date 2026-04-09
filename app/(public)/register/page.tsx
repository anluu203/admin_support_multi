import { Heading, Text } from "@/app/components";
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <Heading level="h1" size="lg" color="default">
          Tạo tài khoản mới
        </Heading>
        <Text color="muted" size="sm">
          Điền thông tin dưới đây để đăng ký tài khoản
        </Text>
      </div>

      {/* Register Form */}
      <RegisterForm />
    </div>
  );
}
