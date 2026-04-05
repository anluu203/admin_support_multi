"use client";

import { Pagination } from "@/app/components/molecules/Pagination";
import { SearchInput } from "@/app/components/molecules/SearchInput";
import { Table, type TableColumn } from "@/app/components/organisms/Table";
import { cn } from "@/app/utils/cn";
import { useState } from "react";

/**
 * Props cho DataTable component
 */
export interface DataTableProps<T = Record<string, unknown>> {
  /** Danh sách cột */
  columns: TableColumn<T>[];
  /** Dữ liệu */
  data: T[];
  /** Trạng thái loading */
  loading?: boolean;
  /** Tổng số item (cho pagination phía server) */
  totalItems?: number;
  /** Page size (mặc định: 10) */
  pageSize?: number;
  /** Callback khi search */
  onSearch?: (query: string) => void;
  /** Callback khi sort */
  onSort?: (key: string, direction: "asc" | "desc") => void;
  /** Callback khi thay đổi page */
  onPageChange?: (page: number) => void;
  /** Hiển thị search */
  showSearch?: boolean;
  /** Hiển thị pagination */
  showPagination?: boolean;
  /** Placeholder search */
  searchPlaceholder?: string;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * DataTable - Component table với search, filter, pagination
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   showSearch
 *   showPagination
 *   onSearch={(query) => setSearchQuery(query)}
 * />
 * ```
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  totalItems,
  pageSize = 10,
  onSearch,
  onSort,
  onPageChange,
  showSearch = true,
  showPagination = true,
  searchPlaceholder = "Tìm kiếm...",
  className,
  "data-testid": dataTestId,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = totalItems
    ? Math.ceil(totalItems / pageSize)
    : Math.ceil(data.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  return (
    <div className={cn("space-y-4", className)} data-testid={dataTestId}>
      {/* Search */}
      {showSearch && (
        <div className="flex items-center justify-between">
          <SearchInput
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        loading={loading}
        onSort={onSort}
      />

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
