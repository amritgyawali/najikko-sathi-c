import Link from "next/link";
import type { Payload } from "payload";
import React from "react";

import { slotFilm, slotPhoto } from "@/lib/page-media";
import { heroSlotKey, mediaPlaceholders, type MediaPlaceholderKind } from "@/lib/site-map";
import type { MediaSlot } from "@/payload-types";
import type { MediaReport } from "../../dashboard/insights";
import { Bars, Empty, Icon, Meter, Panel, Ring, Tag, nf, size } from "./ui";

/**
 * Photos and films - every place on the website that can carry a picture, what
 * is in it, and one link to fill it.
 *
 * The point of the panel is that an owner who wants a photograph on a page
 * should not have to know that the photograph lives in a collection called Page
 * media, under a key that has to match the page's name. They should see the
 * page, see that it has no picture, and click.
 *
 * Beside it sits the state of the file library itself: how much has been
 * uploaded, how much of it nobody has described, and which files are heavy
 * enough to be slowing a page down. Those two things - the empty places and the
 * badly-prepared files - are the whole of what goes wrong with pictures on a
 * small website.
 */

type Props = { payload?: Payload; report?: MediaReport };

type Row = {
  key: string;
  label: string;
  path: string;
  note: string;
  kind: MediaPlaceholderKind;
  id?: string | number;
  hasPhoto: boolean;
  hasFilm: boolean;
};

function SlotRow({ row }: { row: Row }) {
  const href = row.id
    ? `/admin/collections/media-slots/${row.id}`
    : "/admin/collections/media-slots/create";
  const filled = row.hasPhoto || row.hasFilm;

  return (
    <li className={`ns-slot${filled ? " is-filled" : ""}`}>
      <span className="ns-slot__icon" aria-hidden="true">
        <Icon name="image" />
      </span>
      <span className="ns-slot__body">
        <span className="ns-slot__top">
          <span className="ns-slot__name">{row.label}</span>
          <a className="ns-studio__path" href={row.path} target="_blank" rel="noreferrer">
            {row.path}
          </a>
          {row.hasPhoto ? <Tag tone="good">Photo</Tag> : null}
          {row.kind === "showcase" && row.hasFilm ? <Tag tone="good">Film</Tag> : null}
          {!filled ? <Tag>Empty</Tag> : null}
        </span>
        <span className="ns-slot__note">{row.note}</span>
      </span>
      <Link className={`ns-chip${filled ? "" : " ns-chip--go"}`} href={href}>
        {filled ? "Change" : row.kind === "showcase" ? "Add photo or film" : "Add a photo"}
      </Link>
    </li>
  );
}

export async function MediaStudio({ payload, report }: Props) {
  if (!payload) return null;

  let slots = new Map<string, MediaSlot>();
  let services: { slug: string; shortTitle?: string | null; title: string }[] = [];

  try {
    const saved = await payload.find({
      collection: "media-slots",
      limit: 500,
      depth: 1,
      pagination: false,
      overrideAccess: true,
    });
    slots = new Map((saved.docs as MediaSlot[]).filter((slot) => slot.key).map((slot) => [slot.key, slot]));

    const published = await payload.find({
      collection: "services",
      limit: 200,
      depth: 0,
      sort: "order",
      overrideAccess: true,
    });
    services = (published.docs as { slug?: string | null; shortTitle?: string | null; title: string }[]).filter(
      (service): service is { slug: string; shortTitle?: string | null; title: string } => Boolean(service.slug),
    );
  } catch {
    // Nothing saved yet. The site's own placeholders are still worth listing.
  }

  const toRow = (key: string, label: string, path: string, note: string, kind: MediaPlaceholderKind): Row => {
    const slot = slots.get(key);
    return {
      key,
      label,
      path,
      note,
      kind,
      id: slot?.id,
      hasPhoto: Boolean(slotPhoto(slot, "")),
      hasFilm: Boolean(slotFilm(slot, "")),
    };
  };

  const rows: Row[] = [
    ...mediaPlaceholders.map((placeholder) =>
      toRow(placeholder.key, placeholder.label, placeholder.path, placeholder.note, placeholder.kind),
    ),
    ...services.flatMap((service) => [
      toRow(
        heroSlotKey(service.slug),
        `${service.shortTitle || service.title} - photo beside the title`,
        `/services/${service.slug}`,
        "The photograph beside this service's title.",
        "hero",
      ),
      toRow(
        service.slug,
        `${service.shortTitle || service.title} - photo & film band`,
        `/services/${service.slug}`,
        "The photograph and film in the band further down this service's page.",
        "showcase",
      ),
    ]),
  ];

  const filled = rows.filter((row) => row.hasPhoto || row.hasFilm);
  const empty = rows.filter((row) => !row.hasPhoto && !row.hasFilm);

  return (
    <>
      <div className="ns-split">
        <Panel
          title="Places that can carry a picture"
          icon="image"
          accent={3}
          meta={`${filled.length} of ${rows.length} filled`}
          actions={
            <Link className="ns-chip ns-chip--go" href="/admin/collections/media/create">
              Upload a file
            </Link>
          }
          intro="Open a row, upload a photograph or a film, and save - the page shows it straight away. Until then nothing at all is drawn there: no panel, no heading and no gap, so an empty row is never something a visitor sees."
        >
          <Meter value={filled.length} total={rows.length} tone={empty.length === 0 ? "good" : "warn"} />
          {empty.length > 0 ? (
            <>
              <h4 className="ns-studio__heading">Still empty</h4>
              <ul className="ns-slots">
                {empty.map((row) => (
                  <SlotRow key={row.key} row={row} />
                ))}
              </ul>
            </>
          ) : (
            <Empty>Every place on the website has a picture in it.</Empty>
          )}

          {filled.length > 0 ? (
            <>
              <h4 className="ns-studio__heading">Already filled</h4>
              <ul className="ns-slots">
                {filled.map((row) => (
                  <SlotRow key={row.key} row={row} />
                ))}
              </ul>
            </>
          ) : null}

          <p className="ns-note">
            A film too large to upload can be published on YouTube and pasted in as a link instead.
          </p>
        </Panel>

        <div className="ns-stack">
          <Panel
            title="The file library"
            icon="image"
            accent={6}
            meta={report ? `${nf(report.files)} files · ${size(report.bytes)}` : undefined}
            actions={
              <Link className="ns-chip" href="/admin/collections/media">
                Open the library
              </Link>
            }
          >
            {report && report.files > 0 ? (
              <>
                <div className="ns-scorerow">
                  <Ring score={report.audit.score} label="Well prepared" />
                  <ul className="ns-facts">
                    <li>
                      <strong>{nf(report.images)}</strong> photographs
                    </li>
                    <li>
                      <strong>{nf(report.films)}</strong> films
                    </li>
                    <li>
                      <strong>{nf(report.documents)}</strong> documents
                    </li>
                    <li className={report.missingAlt > 0 ? "is-warn" : undefined}>
                      <strong>{nf(report.missingAlt)}</strong> with no description
                    </li>
                  </ul>
                </div>
                {report.heaviest.length > 0 ? (
                  <>
                    <h4 className="ns-studio__heading">Heaviest files</h4>
                    <Bars
                      accent={6}
                      empty="Nothing uploaded yet."
                      rows={report.heaviest.map((file) => ({
                        label: file.name,
                        count: Math.round(file.bytes / 1024),
                        share: Math.round((file.bytes / Math.max(1, report.bytes)) * 100),
                      }))}
                    />
                    <p className="ns-note">
                      Sizes in kilobytes. Anything over about 2 MB is worth saving smaller and uploading
                      again - it is the most common reason a page feels slow.
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <Empty>
                Nothing has been uploaded yet. Everything on the website - photographs, films and
                documents - is uploaded here once and then used anywhere.
              </Empty>
            )}
          </Panel>

          {report && report.audit.findings.length > 0 ? (
            <Panel title="Files worth fixing" icon="alert" accent={2} meta={`${report.audit.findings.length} to look at`}>
              <ul className="ns-findings">
                {report.audit.findings.slice(0, 8).map((finding) => (
                  <li className={`ns-finding ns-finding--${finding.severity}`} key={`${finding.where}-${finding.title}`}>
                    <Link className="ns-finding__title" href={finding.href}>
                      {finding.title}
                    </Link>
                    <span className="ns-finding__where">{finding.where}</span>
                    <span className="ns-finding__fix">{finding.fix}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default MediaStudio;
