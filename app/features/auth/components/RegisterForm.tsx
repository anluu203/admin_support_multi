"use client";

import { ButtonWithIcon, Form, FormField, Input, Text } from "@/app/components";
import { isOk } from "@/app/lib/api/result";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { register as registerApi } from "../api/authApi";

/**
 * Register form data
 */
interface RegisterFormData {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

/**
 * RegisterForm - Form đăng ký với react-hook-form
 */
export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setFormError(null);

    // Validate cơ bản
    if (!data.email || !data.email.includes("@")) {
      form.setError("email", { message: "Email không hợp lệ" });
      setIsLoading(false);
      return;
    }

    // Username: 3-20 ký tự, chỉ chữ cái, số, gạch dưới
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!data.username || !usernameRegex.test(data.username)) {
      form.setError("username", {
        message: "Tên đăng nhập phải có 3-20 ký tự (chữ, số, gạch dưới)",
      });
      setIsLoading(false);
      return;
    }

    if (!data.fullName || data.fullName.trim().length < 2) {
      form.setError("fullName", {
        message: "Họ tên phải có ít nhất 2 ký tự",
      });
      setIsLoading(false);
      return;
    }

    // Password: Ít nhất 8 ký tự, có chữ hoa, chữ thường, số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!data.password || !passwordRegex.test(data.password)) {
      form.setError("password", {
        message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số",
      });
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        message: "Mật khẩu xác nhận không khớp",
      });
      setIsLoading(false);
      return;
    }

    // Gọi API đăng ký
    const result = await registerApi({
      email: data.email,
      username: data.username,
      fullName: data.fullName,
      password: data.password,
    });

    if (isOk(result)) {
      // Redirect về trang đăng nhập với thông báo thành công
      router.push("/login?registered=true");
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
        submitText="Đăng ký"
        isLoading={isLoading}
        formError={formError}
        data-testid="register-form"
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
            data-testid="register-email"
          />
        </FormField>

        {/* Username Field */}
        <FormField
          label="Tên đăng nhập"
          error={form.formState.errors.username?.message}
          required
        >
          <Input
            {...form.register("username")}
            type="text"
            placeholder="nguyenvana"
            autoComplete="username"
            error={form.formState.errors.username?.message}
            data-testid="register-username"
          />
        </FormField>

        {/* Full Name Field */}
        <FormField
          label="Họ và tên"
          error={form.formState.errors.fullName?.message}
          required
        >
          <Input
            {...form.register("fullName")}
            type="text"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            error={form.formState.errors.fullName?.message}
            data-testid="register-fullname"
          />
        </FormField>

        {/* Password Field */}
        <FormField
          label="Mật khẩu"
          error={form.formState.errors.password?.message}
          hint="Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
          required
        >
          <Input
            {...form.register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            data-testid="register-password"
          />
        </FormField>

        {/* Confirm Password Field */}
        <FormField
          label="Xác nhận mật khẩu"
          error={form.formState.errors.confirmPassword?.message}
          required
        >
          <Input
            {...form.register("confirmPassword")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={form.formState.errors.confirmPassword?.message}
            data-testid="register-confirm-password"
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

      {/* Google Register */}
      <ButtonWithIcon
        icon={LogIn}
        iconPosition="left"
        variant="outline"
        fullWidth
        onClick={() => {
          // TODO: Implement Google SSO
          console.log("Google register");
        }}
      >
        Đăng ký với Google
      </ButtonWithIcon>

      {/* Footer */}
      <div className="text-center">
        <Text size="sm" color="muted">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-primary hover:underline">
            Đăng nhập ngay
          </a>
        </Text>
      </div>
    </div>
  );
}
