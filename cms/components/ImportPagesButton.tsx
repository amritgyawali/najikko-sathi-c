"use client";

import { useRouter } from "next/navigation";
import React from "react";

/**
 * "Add them to the dashboard".
 *
 * Posts to the endpoint in cms/endpoints/site-pages.ts, which creates a Page
 * document for each of the website's built-in pages, holding exactly the copy
 * that page already shows. Nothing on the website changes; what changes is that
 * every word of those pages becomes editable in Content → Website pages.
 *
 * Pass `paths` to import one page rather than all of them.
 */
export function ImportPagesButton({
  paths,
  label = "Add them to the dashboard",
  busyLabel = "Adding…",
}: {
  paths?: string[];
  label?: string;
  busyLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/site-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "import", ...(paths ? { paths } : {}) }),
      });
      const result = (await response.json()) as { error?: string; failed?: { reason: string }[] };
      if (!response.ok) throw new Error(result.error || "The pages could not be added.");
      if (result.failed?.length) throw new Error(result.failed[0].reason);
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The pages could not be added.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="ns-page__action ns-page__action--go" disabled={busy} onClick={run} type="button">
        {busy ? busyLabel : label}
      </button>
      {error ? <span className="ns-pages__error">{error}</span> : null}
    </>
  );
}
