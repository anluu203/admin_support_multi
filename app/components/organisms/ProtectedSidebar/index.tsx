"use client"; // Bắt buộc phải có vì dùng hook

import { Button, Divider } from "@/app/components";
import { LayoutDashboard, LogOut, Settings, Users, Ticket, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 

interface ProtectedSidebarProps {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Phân quyền", href: "/phan-quyen" },
  { icon: Settings, label: "Cài đặt", href: "/cai-dat" },
  { icon: MessageCircle, label: "Quản lý chat", href: "/dashboard/chat" },
];

export default function ProtectedSidebar({
  onLogout,
}: ProtectedSidebarProps) {
  const pathname = usePathname();

  const checkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-border bg-white">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
          HĐ
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 leading-tight">
            Chat Multi Support
          </span>
          <span className="text-xs text-slate-500">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 px-3 py-4 scrollbar-thin scrollbar-thumb-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkActive(item.href);

          return (
            <Link
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-background-muted"
              }`}
            >
              <Icon 
                size={20} 
                className={`${isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"}`} 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Divider />

      <div className="px-4 py-4 flex-shrink-0">
        <Button
          variant="outline"
          fullWidth
          onClick={onLogout}
          className="gap-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
}