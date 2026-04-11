"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if screen size is mobile (< 768px)
 * Uses matchMedia for efficient viewport tracking
 * Value: false on server, updates on client after hydration
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Media query for md breakpoint (768px)
    const mq = window.matchMedia("(max-width: 767px)");

    // Set initial state
    setIsMobile(mq.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

/**
 * Hook to detect if screen size is tablet (768-1023px)
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    // Media query for md-lg range (768-1023px)
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");

    setIsTablet(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsTablet(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isTablet;
}
