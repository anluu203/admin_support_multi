"use client";

import { ProtectedAuthLayout } from "@/app/components/organisms";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * User interface from localStorage
 */
interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

/**
 * Protected Auth Layout - Layout cho protected pages
 *
 * Kiểm tra authentication trước khi render children.
 * Nếu không có accessToken, redirect về /login.
 * Nếu đã xác thực, hiển thị ProtectedAuthLayout wrapper.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication
    const accessToken = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    // No token or user data → redirect to login
    if (!accessToken || !userStr) {
      router.replace("/login");
      return;
    }

    // Parse user data
    let userData: User | null = null;
    try {
      userData = JSON.parse(userStr) as User;
    } catch {
      console.error("Failed to parse user data");
      router.replace("/login");
      return;
    }

    // Auth verified → allow rendering (defer state update to avoid cascading renders)
    const timer = setTimeout(() => {
      setUser(userData);
      setIsAuthorized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  // Show loading spinner while checking auth


  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <ProtectedAuthLayout
      pageTitle="Dashboard"
      userName={user.fullName}
      userEmail={user.email}
    >
      {children}
    </ProtectedAuthLayout>
  );
}
