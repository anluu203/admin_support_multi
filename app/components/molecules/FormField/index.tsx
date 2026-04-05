import { Label } from "@/app/components/atoms/Label";
import { cn } from "@/app/utils/cn";

/**
 * Props cho FormField component
 */
export interface FormFieldProps {
  /** Nội dung field (Input, Select, etc.) */
  children: React.ReactNode;
  /** Nhãn field */
  label?: string;
  /** ID cho input */
  htmlFor?: string;
  /** Thông báo lỗi */
  error?: string | string[];
  /** Gợi ý */
  hint?: string;
  /** Đánh dấu bắt buộc */
  required?: boolean;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * FormField - Component wrapper cho form field với label và error
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   htmlFor="email"
 *   error={errors.email}
 *   required
 * >
 *   <Input id="email" type="email" />
 * </FormField>
 * ```
 */
export function FormField({
  children,
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  "data-testid": dataTestId,
}: FormFieldProps) {
  const errorMessages = Array.isArray(error) ? error : error ? [error] : [];

  return (
    <div className={cn("space-y-2", className)} data-testid={dataTestId}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-sm text-text-muted">{hint}</p>
      )}
      {errorMessages.length > 0 && (
        <div className="space-y-1">
          {errorMessages.map((msg, index) => (
            <p key={index} className="text-sm text-error">
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
