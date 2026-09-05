"use client";

import { useTheme } from "@payloadcms/ui";
import React from "react";

/**
 * Light / dark switch for the dashboard header.
 *
 * Payload follows the operating system until someone makes a choice here, which
 * is why the panel looks dark on a dark machine with no way back. Choosing a
 * side stores the preference against the signed-in account.
 */
export function ThemeToggle() {
  const { autoMode, setTheme, theme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="ns-theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={
        autoMode
          ? `Following your device (${theme}). Switch to ${next} mode.`
          : `Switch to ${next} mode`
      }
    >
      <span className="ns-theme-toggle__icon" aria-hidden="true">
        {theme === "dark" ? (
          /* Sun: clicking moves to light. */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          /* Moon: clicking moves to dark. */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8" />
          </svg>
        )}
      </span>
      <span className="ns-theme-toggle__label">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
