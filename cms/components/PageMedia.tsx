import Link from "next/link";
import type { Payload } from "payload";
import React from "react";

import type { MediaSlot } from "@/payload-types";
import { slotFilm, slotPhoto } from "@/lib/page-media";
import { mediaPlaceholders } from "@/lib/site-map";

/**
 * "Photos & films" - the panel under the page list on the dashboard home.
 *
 * Every blue placeholder on the website is listed here with what it holds so
 * far and a link straight to the entry that fills it. That is the whole point
 * of the panel: an owner who wants to put a picture on a page should not have
 * to know that the picture lives in a collection called Page media under a key
 * that has to match the page's name.
 *
 * The fixed placeholders come from lib/site-map.ts, which `npm run check:pages`
 * keeps honest. Service pages are read from the database, since services are
 * written in the dashboard and each one carries a band of its own.
 */

type Props = { payload?: Payload };

type Row = {
  key: string;
  label: string;
  /** The page it appears on. */
  path: string;
  note: string;
  /** The Page media document, once one exists. */
  id?: string | number;
  hasPhoto: boolean;
  hasFilm: boolean;
};

function StateTags({ row }: { row: Row }) {
  return (
    <span className="ns-slot__tags">
      <span className={`ns-slot__tag${row.hasPhoto ? " ns-slot__tag--on" : ""}`}>
        {row.hasPhoto ? "Photo added" : "No photo"}
      </span>
      <span className={`ns-slot__tag${row.hasFilm ? " ns-slot__tag--on" : ""}`}>
        {row.hasFilm ? "Film added" : "No film"}
      </span>
    </span>
  );
}

function SlotRow({ row }: { row: Row }) {
  const href = row.id
    ? `/admin/collections/media-slots/${row.id}`
    : "/admin/collections/media-slots/create";

  return (
    <li className="ns-page">
      <div className="ns-page__head">
        <span className="ns-page__name">{row.label}</span>
        <a className="ns-page__path" href={row.path} target="_blank" rel="noreferrer">
          {row.path}
        </a>
        <StateTags row={row} />
      </div>
      <p className="ns-page__summary">{row.note}</p>
      <span className="ns-page__edits">
        <Link className="ns-page__edit" href={href}>
          {row.hasPhoto || row.hasFilm ? "Change the photo or film" : "Add a photo or film"}
          {row.id ? null : <span className="ns-page__note"> · key “{row.key}”</span>}
        </Link>
      </span>
    </li>
  );
}

export async function PageMedia({ payload }: Props) {
  if (!payload) return null;

  let slots = new Map<string, MediaSlot>();
  let services: { slug: string; shortTitle?: string | null; title: string }[] = [];

  try {
    const saved = await payload.find({
      collection: "media-slots",
      limit: 500,
      // Enough to populate the uploads, so a row's state is read the same way
      // the website reads it.
      depth: 1,
      pagination: false,
      overrideAccess: true,
    });
    slots = new Map(
      (saved.docs as MediaSlot[]).filter((slot) => slot.key).map((slot) => [slot.key, slot]),
    );

    const published = await payload.find({
      collection: "services",
      limit: 200,
      depth: 0,
      sort: "order",
      overrideAccess: true,
    });
    services = (published.docs as { slug?: string | null; shortTitle?: string | null; title: string }[])
      .filter((service): service is { slug: string; shortTitle?: string | null; title: string } =>
        Boolean(service.slug),
      );
  } catch {
    // Before the database is migrated there is nothing to read. The panel still
    // lists the site's own placeholders, which is the useful half.
  }

  const toRow = (
    key: string,
    label: string,
    path: string,
    note: string,
  ): Row => {
    const slot = slots.get(key);
    return {
      key,
      label,
      path,
      note,
      id: slot?.id,
      hasPhoto: Boolean(slotPhoto(slot, "")),
      hasFilm: Boolean(slotFilm(slot, "")),
    };
  };

  const rows = [
    ...mediaPlaceholders.map((placeholder) =>
      toRow(placeholder.key, placeholder.label, placeholder.path, placeholder.note),
    ),
    ...services.map((service) =>
      toRow(
        service.slug,
        `${service.shortTitle || service.title} photo & film`,
        `/services/${service.slug}`,
        "The photograph and film in the band on this service's page.",
      ),
    ),
  ];

  const filled = rows.filter((row) => row.hasPhoto || row.hasFilm).length;

  return (
    <section className="ns-pages ns-slots">
      <div className="ns-panel__head">
        <h3 className="ns-panel__title">Photos &amp; films</h3>
        <span className="ns-panel__meta">
          {filled} of {rows.length} placeholders filled
        </span>
      </div>
      <p className="ns-pages__hint">
        Each row below is a blue placeholder on the website. Open one, upload a photograph or a
        film, and save - the page shows it straight away. A film that is too large to upload can
        be published on YouTube and pasted in as a link instead.
      </p>

      <ul className="ns-pages__list">
        {rows.map((row) => (
          <SlotRow key={row.key} row={row} />
        ))}
      </ul>
    </section>
  );
}
