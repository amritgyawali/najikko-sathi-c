"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConfig } from "@payloadcms/ui";

/**
 * The two links that sit above the collection list in the sidebar: back to the
 * dashboard home, and out to the public website.
 *
 * Payload's own menu lists collections only, so from inside a document there
 * was no way back to the overview short of the breadcrumb or the logo.
 */
export function NavDashboardLink() {
  const { config } = useConfig();
  const pathname = usePathname();
  const adminRoute = config?.routes?.admin || "/admin";
  const onDashboard = pathname === adminRoute || pathname === `${adminRoute}/`;

  return (
    <div className="ns-nav-top">
      <Link
        className={`ns-nav-top__link ns-nav-top__link--home${onDashboard ? " is-current" : ""}`}
        href={adminRoute}
        aria-current={onDashboard ? "page" : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
        </svg>
        Dashboard
      </Link>
      <a className="ns-nav-top__link" href="/" target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
        </svg>
        View website
      </a>
    </div>
  );
}

export default NavDashboardLink;
