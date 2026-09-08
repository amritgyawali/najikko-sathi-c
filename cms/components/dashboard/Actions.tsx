"use client";

import { useConfig } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * The buttons on the dashboard that actually do something, rather than
 * navigating somewhere that does something.
 *
 * Two of them, and both follow the same rule: say what is happening while it
 * happens, say what happened when it is over, and never leave the page looking
 * unchanged after a click.
 */

type Job = "refresh" | "backup";

const JOBS: Record<Job, { path: string; busy: string; ok: (body: Record<string, unknown>) => string }> = {
  refresh: {
    path: "/site-tools/refresh",
    busy: "Rebuilding the website…",
    ok: (body) => (typeof body.message === "string" ? body.message : "The website has been rebuilt."),
  },
  backup: {
    path: "/site-backup/run",
    busy: "Taking a copy…",
    ok: (body) =>
      typeof body.summary === "string"
        ? `Copy taken - ${body.summary}.`
        : "A copy of the website has been saved.",
  },
};

export function RunButton({
  job,
  label,
  hint,
  primary,
}: {
  job: Job;
  label: string;
  hint?: string;
  primary?: boolean;
}) {
  const { config } = useConfig();
  const router = useRouter();
  const api = config?.routes?.api || "/api";
  const [state, setState] = React.useState<{ busy: boolean; said: string | null; failed: boolean }>({
    busy: false,
    said: null,
    failed: false,
  });

  const run = async () => {
    const spec = JOBS[job];
    setState({ busy: true, said: spec.busy, failed: false });

    try {
      const response = await fetch(`${api}${spec.path}`, { method: "POST", credentials: "include" });
      const body = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        setState({
          busy: false,
          failed: true,
          said: typeof body.error === "string" ? body.error : "That did not work. Try again in a moment.",
        });
        return;
      }

      setState({ busy: false, failed: false, said: spec.ok(body) });
      // The panels around this button show counts and dates that the job just
      // changed, so the server components are asked for their figures again.
      router.refresh();
    } catch {
      setState({ busy: false, failed: true, said: "The dashboard could not reach the server." });
    }
  };

  return (
    <span className="ns-run">
      <button
        type="button"
        className={`ns-btn${primary ? " ns-btn--primary" : ""}`}
        onClick={() => void run()}
        disabled={state.busy}
        title={hint}
      >
        {state.busy ? "Working…" : label}
      </button>
      {state.said ? (
        <span className={`ns-run__said${state.failed ? " ns-run__said--bad" : ""}`} role="status">
          {state.said}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Publish or unpublish a page without opening it.
 *
 * Taking a page off the website is the change most often wanted in a hurry, and
 * it was four clicks and a scroll away in the document's sidebar. Here it is one
 * click from the list of pages, and the wording says what will happen to the
 * website rather than what will happen to the record.
 */
export function PublishToggle({
  collection,
  id,
  status,
  title,
}: {
  collection: string;
  id: string | number;
  status: "draft" | "published";
  title: string;
}) {
  const { config } = useConfig();
  const router = useRouter();
  const api = config?.routes?.api || "/api";
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState<string | null>(null);

  const publishing = status !== "published";

  const toggle = async () => {
    setBusy(true);
    setFailed(null);
    try {
      const response = await fetch(`${api}/${collection}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        // Payload keeps drafts as versions, so the published copy is the one
        // being changed here - the same thing the Publish button in the
        // document does.
        body: JSON.stringify({ status: publishing ? "published" : "draft", _status: "published" }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { errors?: { message?: string }[] };
        setFailed(body.errors?.[0]?.message ?? "That change was refused.");
        return;
      }
      router.refresh();
    } catch {
      setFailed("The dashboard could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`ns-chip${publishing ? " ns-chip--go" : ""}`}
        onClick={() => void toggle()}
        disabled={busy}
        title={
          publishing
            ? `Put "${title}" on the website`
            : `Take "${title}" off the website. The address stops answering.`
        }
      >
        {busy ? "Saving…" : publishing ? "Publish" : "Take off site"}
      </button>
      {failed ? <span className="ns-run__said ns-run__said--bad">{failed}</span> : null}
    </>
  );
}
