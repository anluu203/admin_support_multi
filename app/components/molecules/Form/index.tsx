"use client";

import { Alert } from "@/app/components/atoms/Alert";
import { Button } from "@/app/components/atoms/Button";
import { cn } from "@/app/utils/cn";
import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Props cho Form component
 */
export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  /** Form instance từ useForm() */
  form: UseFormReturn<TFieldValues>;
  /** Submit handler */
  onSubmit: (data: TFieldValues) => Promise<void> | void;
  /** Form children */
  children: ReactNode;
  /** Submit button text (mặc định: "Gửi") */
  submitText?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Form errors (hiển thị ở đầu form) */
  formError?: string | string[] | null;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Form - Base component cho form handling
 * 
 * @example
 * ```tsx
 * const form = useForm<LoginData>();
 * 
 * <Form
 *   form={form}
 *   onSubmit={handleSubmit}
 *   submitText="Đăng nhập"
 *   isLoading={isLoading}
 *   formError={error}
 * >
 *   <FormField label="Email" error={form.formState.errors.email?.message}>
 *     <Input {...form.register("email")} />
 *   </FormField>
 * </Form>
 * ```
 */
export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  submitText = "Gửi",
  isLoading = false,
  formError,
  className,
  "data-testid": dataTestId,
}: FormProps<TFieldValues>) {
  const errors = Array.isArray(formError)
    ? formError
    : formError
    ? [formError]
    : [];

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
      noValidate
      data-testid={dataTestId}
    >
      {/* Form Errors */}
      {errors.length > 0 && (
        <Alert variant="error">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {/* Form Fields */}
      {children}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        {submitText}
      </Button>
    </form>
  );
}
