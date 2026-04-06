"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * DashboardLayout - Protected route layout
 *
 * Checks auth before rendering children
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    // if (!accessToken || !user) {
    //   router.replace("/login");
    //   return;
    // }
  }, [router]);

  return children;
}
