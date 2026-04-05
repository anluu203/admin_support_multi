import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Tùy chỉnh twMerge để nhận diện kích thước phông chữ và độ bo tròn góc tùy chỉnh.
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["xxs"] }],
      rounded: [{ rounded: ["xxs"] }],
    },
  },
});

/**
 * Hàm tiện ích để nối các tên lớp
 * @param inputs Mảng các tên lớp
 * @returns Tên lớp đã được nối
 */
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
