"use client";

import { ButtonWithIcon, Form, FormField, Input, Text } from "@/app/components";
import { isOk } from "@/app/lib/api/result";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api/authApi";

/**
 * Login form data
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * LoginForm - Form đăng nhập với react-hook-form
 */
export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setFormError(null);

    // Validate cơ bản
    if (!data.email || !data.email.includes("@")) {
      form.setError("email", { message: "Email không hợp lệ" });
      setIsLoading(false);
      return;
    }

    if (!data.password || data.password.length < 6) {
      form.setError("password", {
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      setIsLoading(false);
      return;
    }

    // Gọi API đăng nhập
    const result = await login(data);

    if (isOk(result)) {
      const { accessToken, refreshToken } = result.data;

      // Lưu tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(result.data.user));

      // Redirect về dashboard
      router.push("/dashboard");
    } else {
      setFormError(result.error.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Form
        form={form}
        onSubmit={onSubmit}
        submitText="Đăng nhập"
        isLoading={isLoading}
        formError={formError}
        data-testid="login-form"
      >
        {/* Email Field */}
        <FormField
          label="Email"
          error={form.formState.errors.email?.message}
          required
        >
          <Input
            {...form.register("email")}
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            data-testid="login-email"
          />
        </FormField>

        {/* Password Field */}
        <FormField
          label="Mật khẩu"
          error={form.formState.errors.password?.message}
          required
        >
          <Input
            {...form.register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            data-testid="login-password"
          />
        </FormField>
      </Form>

      {/* Or divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background-surface px-2 text-text-muted">
            Hoặc
          </span>
        </div>
      </div>

      {/* Google Login */}
      <ButtonWithIcon
        icon={LogIn}
        iconPosition="left"
        variant="outline"
        fullWidth
        onClick={() => {
          // TODO: Implement Google SSO
          console.log("Google login");
        }}
      >
        Đăng nhập với Google
      </ButtonWithIcon>

      {/* Footer */}
      <div className="text-center">
        <Text size="sm" color="muted">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-primary hover:underline">
            Đăng ký ngay
          </a>
        </Text>
      </div>
    </div>
  );
}
