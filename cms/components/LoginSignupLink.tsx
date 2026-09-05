import Link from "next/link";
import React from "react";

/**
 * Rendered under the dashboard login form. New accounts are created on the
 * public sign-up page, since Payload's login screen is reachable when signed
 * out and a custom admin view is not.
 */
export function LoginSignupLink() {
  return (
    <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
      <span style={{ color: "var(--theme-elevation-500)" }}>Don&apos;t have an account? </span>
      <Link href="/signup" style={{ fontWeight: 600 }}>Create one</Link>
      <div style={{ color: "var(--theme-elevation-400)", fontSize: 12, marginTop: 6 }}>
        An administrator approves new accounts before they can sign in.
      </div>
    </div>
  );
}
