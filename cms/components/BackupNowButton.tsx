"use client";

import { useRouter } from "next/navigation";
import React from "react";

/**
 * "Take a copy now" - above the list of backups.
 *
 * The schedule takes one every day by itself; this is for the moment before
 * someone makes a large change on purpose and would rather not wait for
 * tonight's.
 */
export function BackupNowButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const response = await fetch("/api/site-backup/run", {
        method: "POST",
        credentials: "include",
      });
      const result = (await response.json()) as { error?: string; summary?: string };
      if (!response.ok) throw new Error(result.error || "The copy could not be taken.");
      setSaved(result.summary ?? "Copy taken.");
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The copy could not be taken.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ns-restore">
      <div className="ns-restore__actions">
        <button
          className="ns-btn ns-btn--primary"
          disabled={busy}
          onClick={run}
          type="button"
        >
          {busy ? "Taking a copy…" : "Take a copy now"}
        </button>
      </div>
      {saved ? <p className="ns-restore__note">Copy taken: {saved}</p> : null}
      {error ? <span className="ns-run__said ns-run__said--bad">{error}</span> : null}
    </div>
  );
}
