import React from "react";
import { Search } from "lucide-react";
import { UserRole, UserStatus } from "@/app/types/user";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tìm kiếm email, username, họ tên..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-4">
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option value="">Tất cả vai trò</option>
          <option value={UserRole.SuperAdmin}>Super Admin</option>
          <option value={UserRole.SubAdmin}>Võ sư (SubAdmin)</option>
          <option value={UserRole.Student}>Học viên</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option value="">Tất cả trạng thái</option>
          <option value={UserStatus.Active}>Active</option>
          <option value={UserStatus.Inactive}>Inactive</option>
          <option value={UserStatus.Suspended}>Suspended</option>
        </select>
      </div>
    </div>
  );
}
