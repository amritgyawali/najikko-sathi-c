"use client";

import React from "react";

import { liveTargetFor } from "../live-urls";

/**
 * The "Link" column in every list table.
 *
 * A list of posts that does not say where any of them ended up is a list you
 * have to open one row at a time. This puts the public address on the row
 * itself, so the whole table can be checked at a glance.
 *
 * Payload hands a cell the whole row, which is all the address needs.
 */
type Props = {
  cellData?: unknown;
  collectionSlug?: string;
  rowData?: Record<string, unknown>;
};

export function LiveLinkCell({ collectionSlug, rowData }: Props) {
  const { path } = liveTargetFor({ collectionSlug, data: rowData ?? {} });
  if (!path) return <span className="ns-cell-link ns-cell-link--none">&mdash;</span>;

  const isDraft = rowData?.status === "draft";

  return (
    <a
      className={`ns-cell-link${isDraft ? " ns-cell-link--draft" : ""}`}
      href={path}
      target="_blank"
      rel="noreferrer"
      // The row itself navigates to the edit screen; this link must not.
      onClick={(event) => event.stopPropagation()}
      title={isDraft ? `${path} - still a draft, so not public yet` : `Open ${path}`}
    >
      <span>{path === "/" ? "/ (home page)" : path}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
      </svg>
    </a>
  );
}

export default LiveLinkCell;
