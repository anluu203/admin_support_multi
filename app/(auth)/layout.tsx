import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | Chat Multi Support",
};

/**
 * Auth Layout - Layout cho các trang auth
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
