import type { NextConfig } from "next";

const nextConfig: NextConfig = {
eslint: {
    // Cảnh báo: Điều này cho phép sản xuất build thành công 
    // ngay cả khi dự án của bạn có lỗi ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
