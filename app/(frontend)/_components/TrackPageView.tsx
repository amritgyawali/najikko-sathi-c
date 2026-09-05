"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reports one view per navigation. `keepalive` lets the request finish even if
 * the visitor immediately clicks away.
 */
export function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {
      // A blocked or failed beacon is not worth surfacing to the visitor.
    });
    return () => controller.abort();
  }, [pathname]);

  return null;
}
