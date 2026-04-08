import { cn } from "@/app/lib/utils/cn";
/**
 * Props cho Label component
 */
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Đánh dấu trường bắt buộc */
  required?: boolean;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Label - Component nhãn cho form field
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email
 * </Label>
 * ```
 */
export function Label({
  children,
  required,
  className,
  "data-testid": dataTestId,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-text",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      data-testid={dataTestId}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-error">*</span>}
    </label>
  );
}
