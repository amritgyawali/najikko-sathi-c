"use client";

import React from "react";

/**
 * The coloured state pill used in every list table.
 *
 * A table where "Draft" and "Published" are both plain grey words is a table an
 * owner has to read word by word. A pill in the colour of its meaning - amber
 * for something still being worked on, green for something a visitor can see,
 * red for something taken down - can be scanned in one pass, which is what a
 * list view is for.
 *
 * One component covers every state field on the site: publishing status, an
 * enquiry's progress, whether a review has been approved. `tone` is worked out
 * from the value, so a collection only has to point its column here.
 */

type Props = {
  cellData?: unknown;
  rowData?: Record<string, unknown>;
};

type Tone = "live" | "waiting" | "off" | "info" | "neutral";

/** What a stored value means, so the same word always gets the same colour. */
const TONES: Record<string, { tone: Tone; label: string }> = {
  // Publishing.
  published: { tone: "live", label: "Published" },
  draft: { tone: "waiting", label: "Draft" },
  // An enquiry, as it moves through the inbox.
  new: { tone: "waiting", label: "New" },
  "in-progress": { tone: "info", label: "In progress" },
  replied: { tone: "live", label: "Replied" },
  closed: { tone: "off", label: "Closed" },
  spam: { tone: "off", label: "Spam" },
  // What kind of page this is.
  route: { tone: "info", label: "Website page" },
  custom: { tone: "neutral", label: "New page" },
  // Who someone is.
  admin: { tone: "info", label: "Administrator" },
  editor: { tone: "live", label: "Editor" },
  author: { tone: "neutral", label: "Author" },
  // Anything else that is a plain yes or no.
  true: { tone: "live", label: "Yes" },
  false: { tone: "off", label: "No" },
};

const describe = (value: unknown): { tone: Tone; label: string } => {
  if (value === null || value === undefined || value === "") {
    return { tone: "neutral", label: "—" };
  }
  const key = String(value).toLowerCase();
  return TONES[key] ?? { tone: "neutral", label: String(value) };
};

export function StateCell({ cellData }: Props) {
  const { tone, label } = describe(cellData);
  return <span className={`ns-pill ns-pill--${tone}`}>{label}</span>;
}

export default StateCell;
