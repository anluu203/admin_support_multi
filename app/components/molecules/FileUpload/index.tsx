"use client";

import { cn } from "@/app/lib/utils/cn";import { Upload, X } from "lucide-react";
import { forwardRef, useState } from "react";

/**
 * Props cho FileUpload component
 */
export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Callback khi file được chọn */
  onFileSelect?: (files: File[]) => void;
  /** Thông báo lỗi */
  error?: string;
  /** Hiển thị preview */
  showPreview?: boolean;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * FileUpload - Component upload file
 *
 * @example
 * ```tsx
 * <FileUpload
 *   accept="image/*"
 *   onFileSelect={(files) => console.log(files)}
 *   showPreview
 * />
 * ```
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      onFileSelect,
      error,
      showPreview = false,
      className,
      "data-testid": dataTestId,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles(selectedFiles);
      onFileSelect?.(selectedFiles);
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFileSelect?.(newFiles);
    };

    return (
      <div className={cn("space-y-2", className)} data-testid={dataTestId}>
        <div
          className={cn(
            "flex items-center justify-center rounded-md border-2 border-dashed border-border p-6 transition-colors",
            "hover:border-primary",
            error && "border-error"
          )}
        >
          <label className="flex cursor-pointer flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-text-muted" />
            <span className="text-sm text-text-muted">
              Nhấn để chọn file
            </span>
            <input
              ref={ref}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              {...props}
            />
          </label>
        </div>

        {showPreview && files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-border bg-background-surface p-2"
              >
                <span className="truncate text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded-md p-1 hover:bg-background-muted"
                  aria-label="Xóa file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
