"use client";

import { useConfig } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * Edit, Publish, Unpublish and Delete on every row of every list table.
 *
 * Taking a post off the website used to mean opening it, finding the status
 * field in the sidebar, changing it and saving - four screens for a one-word
 * change. These sit beside the tick box instead, so the whole job is one click
 * from the list, and the list is where an editor already is.
 *
 * The buttons are always drawn, in the same order, on every row. The two that
 * change publication are dimmed on collections that have no published state
 * rather than being left out, so a row never changes shape from one collection
 * to the next.
 */

type Props = {
  cellData?: unknown;
  collectionSlug?: string;
  rowData?: Record<string, unknown>;
};

/**
 * How a collection says "this is on the website".
 *
 * Most content carries a draft/published select. A review is public once it has
 * been approved, which is the same decision under a different name, so the same
 * two buttons drive it. Everything else - files, redirects, accounts, the
 * enquiry inbox - has no such state at all.
 */
type Publishing =
  | { kind: "status"; published: boolean }
  | { kind: "approved"; published: boolean }
  | { kind: "none" };

function publishingOf(collectionSlug: string | undefined, row: Record<string, unknown>): Publishing {
  if (typeof row.status === "string") return { kind: "status", published: row.status === "published" };
  // Accounts are approved too, but that is who may sign in, not what the public
  // can see, and it is not something to toggle from a list by accident.
  if (collectionSlug === "reviews" && typeof row.approved === "boolean") {
    return { kind: "approved", published: row.approved };
  }
  return { kind: "none" };
}

const ICONS = {
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z M13.5 6.5l4 4",
  publish: "M12 19V5 M5 12l7-7 7 7",
  unpublish: "M12 5v14 M19 12l-7 7-7-7",
  remove: "M4 7h16 M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2 M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13",
};

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {path.split(" M").map((segment, index) => (
        <path d={index === 0 ? segment : `M${segment}`} key={index} />
      ))}
    </svg>
  );
}

export function RowActionsCell({ collectionSlug, rowData }: Props) {
  const router = useRouter();
  const { config } = useConfig();

  const [busy, setBusy] = React.useState<null | "publish" | "unpublish" | "delete">(null);
  const [failed, setFailed] = React.useState<string | null>(null);

  const row = rowData ?? {};
  const id = row.id === undefined || row.id === null ? "" : String(row.id);
  const publishing = publishingOf(collectionSlug, row);

  if (!collectionSlug || !id) return null;

  const adminRoute = config.routes?.admin ?? "/admin";
  const apiBase = `${config.serverURL ?? ""}${config.routes?.api ?? "/api"}`;
  const editHref = `${adminRoute}/collections/${collectionSlug}/${id}`;

  /** The row itself opens the document, so an action must not also do that. */
  const contain = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const send = async (action: "publish" | "unpublish" | "delete") => {
    setBusy(action);
    setFailed(null);

    try {
      // Deliberately not "?draft=true". The website reads the `status` field
      // off the published version (lib/content.ts), so saving this as a draft
      // would leave the published version still saying "published" and the
      // page still on the site. Publishing the version is what makes the
      // change take effect.
      const url = `${apiBase}/${collectionSlug}/${encodeURIComponent(id)}`;
      const response =
        action === "delete"
          ? await fetch(url, { method: "DELETE", credentials: "include" })
          : await fetch(url, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                publishing.kind === "approved"
                  ? { approved: action === "publish" }
                  : { status: action === "publish" ? "published" : "draft" },
              ),
            });

      if (!response.ok) {
        // Payload explains a refusal properly - an access rule, a required
        // field - and that is far more use than "something went wrong".
        const body = (await response.json().catch(() => null)) as { errors?: { message?: string }[] } | null;
        throw new Error(body?.errors?.[0]?.message ?? `${response.status} ${response.statusText}`);
      }

      // The row is stale the moment this succeeds, so re-read the list.
      router.refresh();
    } catch (error) {
      setFailed(error instanceof Error ? error.message : "That did not work.");
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = () => {
    const name = typeof row.title === "string" ? row.title : typeof row.name === "string" ? row.name : "this";
    if (window.confirm(`Delete ${name}? This cannot be undone.`)) void send("delete");
  };

  const publishable = publishing.kind !== "none";
  const isPublished = publishable && publishing.published;
  const noStateReason = "This one has no published state - it is either there or it is not.";

  return (
    <div className="ns-rowacts" onClick={contain} role="group" aria-label="Actions for this row">
      <a
        className="ns-rowacts__btn"
        href={editHref}
        title="Edit"
        aria-label="Edit"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Icon path={ICONS.edit} />
      </a>

      <button
        className="ns-rowacts__btn ns-rowacts__btn--publish"
        type="button"
        disabled={!publishable || isPublished || busy !== null}
        title={!publishable ? noStateReason : isPublished ? "Already on the website" : "Publish"}
        aria-label="Publish"
        onClick={(event) => {
          contain(event);
          void send("publish");
        }}
      >
        <Icon path={ICONS.publish} />
      </button>

      <button
        className="ns-rowacts__btn ns-rowacts__btn--unpublish"
        type="button"
        disabled={!publishable || !isPublished || busy !== null}
        title={!publishable ? noStateReason : !isPublished ? "Not on the website yet" : "Unpublish"}
        aria-label="Unpublish"
        onClick={(event) => {
          contain(event);
          void send("unpublish");
        }}
      >
        <Icon path={ICONS.unpublish} />
      </button>

      <button
        className="ns-rowacts__btn ns-rowacts__btn--delete"
        type="button"
        disabled={busy !== null}
        title="Delete"
        aria-label="Delete"
        onClick={(event) => {
          contain(event);
          confirmDelete();
        }}
      >
        <Icon path={ICONS.remove} />
      </button>

      {busy ? <span className="ns-rowacts__busy" aria-live="polite" /> : null}
      {failed ? (
        <span className="ns-rowacts__failed" role="alert" title={failed}>
          !
        </span>
      ) : null}
    </div>
  );
}

export default RowActionsCell;
