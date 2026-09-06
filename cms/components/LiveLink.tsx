"use client";

import React from "react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

import { liveTargetFor } from "../live-urls";

/**
 * The "where this lives" link shown at the top of every document and global.
 *
 * Saving a post used to leave no clue where it had gone. This puts the public
 * address on the page: click it to open the live page in a new tab, or copy it
 * to send to somebody.
 *
 * Each field is read with its own selector so the component only re-renders
 * when the value it actually uses changes.
 */
export function LiveLink() {
  const { collectionSlug, globalSlug, savedDocumentData } = useDocumentInfo();

  const slug = useFormFields(([fields]) => fields?.slug?.value);
  const status = useFormFields(([fields]) => fields?.status?.value);
  const placements = useFormFields(([fields]) => fields?.placements?.value);
  const key = useFormFields(([fields]) => fields?.key?.value);
  const from = useFormFields(([fields]) => fields?.from?.value);
  const approved = useFormFields(([fields]) => fields?.approved?.value);

  const [copied, setCopied] = React.useState(false);

  const saved = (savedDocumentData ?? {}) as Record<string, unknown>;
  const { path, where } = liveTargetFor({
    collectionSlug,
    globalSlug,
    data: {
      // The form holds the newest value; the saved document covers fields the
      // form does not expose, such as an upload's own URL.
      slug: slug ?? saved.slug,
      placements: placements ?? saved.placements,
      key: key ?? saved.key,
      from: from ?? saved.from,
      approved: approved ?? saved.approved,
      url: saved.url,
    },
  });

  // Nothing useful to say about accounts, analytics or the enquiry inbox.
  if (!path && !where) return null;

  const isDraft = status === "draft";
  const unsaved = !globalSlug && !savedDocumentData;

  const copy = async () => {
    if (!path) return;
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the link itself still works.
    }
  };

  return (
    <div className="ns-live">
      <span className="ns-live__label">On the website</span>
      {path ? (
        <>
          <a className="ns-live__link" href={path} target="_blank" rel="noreferrer">
            <span className="ns-live__path">{path === "/" ? "/ (home page)" : path}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
            <span className="ns-live__sr"> (opens in a new tab)</span>
          </a>
          <button className="ns-live__copy" type="button" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </>
      ) : (
        <span className="ns-live__pending">{where}</span>
      )}
      {path && isDraft ? (
        <span className="ns-live__flag">Draft &ndash; publish it to make this page public</span>
      ) : null}
      {path && unsaved ? <span className="ns-live__flag">Save first &ndash; the page is not there yet</span> : null}
    </div>
  );
}

export default LiveLink;
