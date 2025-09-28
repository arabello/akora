import { useEffect, useState } from "react";

// Returns { isMobile } based on a CSS-like breakpoint using matchMedia
export const useResponsiveLayout = () => {
  const getIsMobile = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 768px)").matches
      : false;

  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile());

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mql = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mql.matches);

    // Initial sync in case SSR hydration differs
    handler();

    // Modern browsers
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    // Fallback for older Safari
    // @ts-ignore - older types
    mql.addListener && mql.addListener(handler);
    return () => {
      // @ts-ignore - older types
      mql.removeListener && mql.removeListener(handler);
    };
  }, []);

  return { isMobile } as const;
};
