"use client";

import React from "react";

/**
 * The picture column in a list table.
 *
 * Photographs are recognised long before filenames are read, so a list of
 * posts, people or page media shows the picture itself rather than
 * "sample-newsroom.png". An empty cell draws the same frame with a picture
 * outline in it, which keeps every row the same height and makes a missing
 * image obvious rather than invisible.
 *
 * A list is queried shallowly, so a column often arrives as the file's id
 * rather than as the file. When that happens the cell fetches the one document
 * it needs and remembers it, so a table of twenty rows pointing at the same
 * photograph asks for it once.
 */

type Upload = {
  id?: number | string;
  url?: string | null;
  alt?: string | null;
  mimeType?: string | null;
  thumbnailURL?: string | null;
};

type Props = {
  cellData?: unknown;
  rowData?: Record<string, unknown>;
};

/** Files already looked up, and lookups still in flight, by id. */
const known = new Map<string, Upload | null>();
const inFlight = new Map<string, Promise<Upload | null>>();

const asUpload = (value: unknown): Upload | null =>
  value && typeof value === "object" && ("url" in value || "thumbnailURL" in value)
    ? (value as Upload)
    : null;

const asId = (value: unknown): string | null => {
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && value !== "") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return id === undefined || id === null ? null : String(id);
  }
  return null;
};

async function lookUp(id: string): Promise<Upload | null> {
  if (known.has(id)) return known.get(id) ?? null;
  const existing = inFlight.get(id);
  if (existing) return existing;

  const request = (async () => {
    try {
      const response = await fetch(`/api/media/${id}?depth=0`, { credentials: "include" });
      const file = response.ok ? ((await response.json()) as Upload) : null;
      known.set(id, file);
      return file;
    } catch {
      // A file that cannot be read simply draws the empty frame.
      known.set(id, null);
      return null;
    } finally {
      inFlight.delete(id);
    }
  })();

  inFlight.set(id, request);
  return request;
}

export function ThumbCell({ cellData, rowData }: Props) {
  // On the Media collection itself the row is the file, so fall back to it.
  const given = asUpload(cellData) ?? asUpload(rowData);
  const id = given ? null : asId(cellData);
  const [fetched, setFetched] = React.useState<Upload | null>(() => (id ? known.get(id) ?? null : null));

  React.useEffect(() => {
    if (!id || known.has(id)) return;
    let live = true;
    void lookUp(id).then((file) => {
      if (live) setFetched(file);
    });
    return () => {
      live = false;
    };
  }, [id]);

  const upload = given ?? fetched;
  const source = upload?.thumbnailURL || upload?.url || null;
  const isFilm = (upload?.mimeType ?? "").startsWith("video");

  if (!source || isFilm) {
    return (
      <span className={`ns-thumb ns-thumb--empty${isFilm ? " ns-thumb--film" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          {isFilm ? (
            <path d="M10 8.5v7l6-3.5-6-3.5ZM4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
          ) : (
            <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 11 5-5 4 4 3-2 5 4M9.5 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          )}
        </svg>
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- the admin panel is not a Next page tree.
  return <img className="ns-thumb" src={source} alt={upload?.alt ?? ""} loading="lazy" />;
}

export default ThumbCell;
