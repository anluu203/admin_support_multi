"use client";

import { Spinner } from "@/app/components/atoms/Spinner";
import { EmptyState } from "@/app/components/molecules/EmptyState";
import { cn } from "@/app/lib/utils/cn";import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";

/**
 * Cột cho Table
 */
export interface TableColumn<T = Record<string, unknown>> {
  /** Key của field */
  key: string;
  /** Tiêu đề cột */
  header: string;
  /** Render cell custom */
  render?: (item: T) => React.ReactNode;
  /** Cho phép sắp xếp */
  sortable?: boolean;
  /** Độ rộng */
  width?: string;
}

/**
 * Props cho Table component
 */
export interface TableProps<T = Record<string, unknown>> {
  /** Danh sách cột */
  columns: TableColumn<T>[];
  /** Dữ liệu */
  data: T[];
  /** Trạng thái loading */
  loading?: boolean;
  /** Callback khi sort */
  onSort?: (key: string, direction: "asc" | "desc") => void;
  /** CSS class bổ sung */
  className?: string;
  /** Test ID */
  "data-testid"?: string;
}

/**
 * Table - Component data table
 *
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'name', header: 'Tên', sortable: true },
 *     { key: 'email', header: 'Email' },
 *   ]}
 *   data={users}
 *   loading={isLoading}
 * />
 * ```
 */
export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  onSort,
  className,
  "data-testid": dataTestId,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Không có dữ liệu"
        description="Chưa có dữ liệu để hiển thị"
      />
    );
  }

  return (
    <div
      className={cn("overflow-x-auto rounded-lg border border-border", className)}
      data-testid={dataTestId}
    >
      <table className="w-full">
        <thead className="bg-background-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-sm font-semibold text-text",
                  column.sortable && "cursor-pointer select-none hover:bg-background-surface"
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="text-text-muted">
                      {sortKey === column.key ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-t border-border hover:bg-background-surface"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-text">
                  {column.render
                    ? column.render(item)
                    : item[column.key]?.toString() || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
