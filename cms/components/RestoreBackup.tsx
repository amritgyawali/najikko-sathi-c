"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * "Put the site back to this" - the panel at the top of a backup.
 *
 * Restoring rewrites every page, post, service and setting to how it was when
 * the copy was taken. That is a large thing to do from one button, so it asks
 * first, in words rather than with a browser confirm box, and it says what
 * happened afterwards rather than only refreshing.
 *
 * The undo is real: the endpoint takes a copy of the present before it changes
 * anything, and the id of that copy is what this panel offers afterwards.
 */

type Report = {
  updated: number;
  created: number;
  deleted: number;
  globals: number;
  recreated: { collection: string; title: string; wasId: string | number; nowId: string | number }[];
  skipped: string[];
  problems: string[];
};

export function RestoreBackup() {
  const { id } = useDocumentInfo();
  const router = useRouter();
  const [asking, setAsking] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<{ report: Report; undoWith: string | number } | null>(null);

  // A backup that has not been saved yet has nothing to restore.
  if (!id) return null;

  const restore = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/site-backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      const result = (await response.json()) as {
        error?: string;
        report?: Report;
        undoWith?: string | number;
      };
      if (!response.ok || !result.report) {
        throw new Error(result.error || "The site could not be put back.");
      }
      setDone({ report: result.report, undoWith: result.undoWith! });
      setAsking(false);
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The site could not be put back.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const { report, undoWith } = done;
    return (
      <div className="ns-restore ns-restore--done">
        <strong>The site has been put back to this copy.</strong>
        <p>
          {report.updated} updated, {report.created} brought back, {report.deleted} removed, and{" "}
          {report.globals} settings restored.
        </p>
        {report.recreated.length > 0 ? (
          <p className="ns-restore__note">
            {report.recreated.length}{" "}
            {report.recreated.length === 1 ? "document was" : "documents were"} deleted before this
            restore and have come back with a new reference:{" "}
            {report.recreated.map((row) => row.title).join(", ")}. Anything that pointed at{" "}
            {report.recreated.length === 1 ? "it" : "them"} - a chosen photograph, say - needs
            picking again.
          </p>
        ) : null}
        {report.problems.length > 0 ? (
          <ul className="ns-restore__problems">
            {report.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        ) : null}
        <p className="ns-restore__note">
          Not what you wanted? A copy of the site as it was a moment ago was taken first:{" "}
          <a href={`/admin/collections/backups/${undoWith}`}>open backup #{undoWith}</a> and restore
          that.
        </p>
      </div>
    );
  }

  return (
    <div className="ns-restore">
      {asking ? (
        <>
          <strong>Put the whole site back to this copy?</strong>
          <p>
            Every page, post, service and setting returns to how it was when this copy was taken.
            Anything written since is removed. Enquiries and dashboard accounts are left alone, and a
            copy of the site as it is now is taken first, so this can be undone.
          </p>
          <div className="ns-restore__actions">
            <button
              className="ns-page__action ns-page__action--go"
              disabled={busy}
              onClick={restore}
              type="button"
            >
              {busy ? "Putting the site back…" : "Yes, put the site back"}
            </button>
            <button
              className="ns-page__action"
              disabled={busy}
              onClick={() => setAsking(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="ns-restore__actions">
          <button className="ns-page__action" onClick={() => setAsking(true)} type="button">
            Put the site back to this
          </button>
          <a className="ns-page__action" href={`/backup?snapshot=${id}`}>
            Download this copy
          </a>
        </div>
      )}
      {error ? <span className="ns-pages__error">{error}</span> : null}
    </div>
  );
}
