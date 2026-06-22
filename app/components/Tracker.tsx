"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    uaTracker?: {
      track: (type: string, extra?: Record<string, number>) => void;
      flush: (useBeacon?: boolean) => void;
      sessionId: string;
    };
  }
}

/**
 * Loads the standalone tracking script and adds SPA awareness: the script
 * fires a `page_view` on the initial load, and this component fires one on each
 * client-side route change (which would otherwise go unrecorded).
 */
export default function Tracker() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      // Initial page_view is handled by tracker.js when the script loads.
      firstRun.current = false;
      return;
    }
    window.uaTracker?.track("page_view");
  }, [pathname]);

  return <Script src="/tracker.js" strategy="afterInteractive" />;
}
