"use client";

import { InputWithIcon } from "@/app/components/molecules/InputWithIcon";
import { Search } from "lucide-react";
import { forwardRef, useState, useEffect } from "react";

/**
 * Props cho SearchInput component
 */
export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Callback khi search */
  onSearch?: (value: string) => void;
  /** Debounce delay (ms) - mặc định: 300 */
  debounce?: number;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * SearchInput - Component input tìm kiếm với debounce
 *
 * @example
 * ```tsx
 * <SearchInput
 *   placeholder="Tìm kiếm..."
 *   onSearch={(value) => console.log(value)}
 *   debounce={500}
 * />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { onSearch, debounce = 300, "data-testid": dataTestId, ...props },
    ref
  ) => {
    const [value, setValue] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        onSearch?.(value);
      }, debounce);

      return () => clearTimeout(timer);
    }, [value, debounce, onSearch]);

    return (
      <InputWithIcon
        ref={ref}
        icon={Search}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-testid={dataTestId}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
