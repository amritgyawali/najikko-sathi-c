import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Film, HeartHandshake, Images } from "lucide-react";

import type { SocialWork } from "@/payload-types";
import { getSocialWork } from "@/lib/content";
import { onPage } from "@/lib/placements";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { youtubeEmbedUrl, youtubeId, youtubeWatchUrl } from "@/lib/youtube";
import { siteUrl } from "../_lib/seo";
import { SectionHeading } from "./page-content";
import { StructuredData } from "./structured-data";
import { PhotoAlbum, type AlbumPhoto } from "./photo-lightbox";

/**
 * The social work, as entered in the dashboard.
 *
 * Every entry carries a title, a description, any number of photographs and any
 * number of YouTube films - each film with a title and a description of its
 * own. All of it is uploaded in Content → Social Work, so adding a project,
 * replacing a photograph or dropping a video never needs a deploy. Nothing here
 * is hard-coded, and the section disappears entirely while it is empty.
 *
 * The band itself shows the entries as cards - a cover photograph, a title, a
 * line or two, and how much there is to see - laid out in a grid that reflows
 * from three across to one. Opening a card goes to that entry's own page, which
 * is where the full description, the whole album and every film are. Before
 * this, a page carrying five entries meant scrolling past five complete albums
 * to reach the last of them; now the whole of the work is visible at once and a
 * visitor chooses what to go into.
 */

/** How long a card's description runs before it is cut at a word. */
const SUMMARY_LENGTH = 165;

/** The line or two printed on a card, from whichever field was written. */
function summarize(entry: SocialWork): string {
  const written = entry.summary?.trim();
  if (written) return written;

  const full = entry.description?.trim() ?? "";
  if (full.length <= SUMMARY_LENGTH) return full;
  const cut = full.slice(0, SUMMARY_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** The photographs on an entry that actually resolve to a file. */
function albumOf(entry: SocialWork): AlbumPhoto[] {
  return (entry.photos ?? [])
    .map((photo) => ({
      src: mediaUrl(photo.image),
      alt: mediaAlt(photo.image, photo.caption || entry.title),
      caption: photo.caption ?? "",
    }))
    .filter((photo): photo is AlbumPhoto => Boolean(photo.src));
}

/** The films on an entry, minus any link that is not a YouTube video. */
function filmsOf(entry: SocialWork) {
  return (entry.videos ?? [])
    .map((video) => ({ ...video, videoId: youtubeId(video.youtubeUrl) }))
    .filter((video): video is typeof video & { videoId: string } => Boolean(video.videoId));
}

export async function SocialWorkSection({
  kicker,
  kickerNe,
  heading,
  headingNe,
  description,
  descriptionNe,
  placement,
}: {
  kicker?: string | null;
  heading?: string | null;
  description?: string | null;
  /** The Nepali written beside each of them, where somebody has written it. */
  kickerNe?: string | null;
  headingNe?: string | null;
  descriptionNe?: string | null;
  /** The page this band is on, so entries published elsewhere stay there. */
  placement?: string | null;
} = {}) {
  const entries = onPage(await getSocialWork(), placement);
  if (entries.length === 0) return null;

  return (
    <section className="content-section social-section" id="social-work">
      <div className="site-container">
        <SectionHeading
          kicker={kicker || "Social work"}
          kickerNe={kickerNe}
          title={heading || "The work we do beside our communities."}
          titleNe={headingNe}
          descriptionNe={descriptionNe}
          description={
            description ||
            "Photographs and films from the social work we take part in, alongside the people and organizations it is done with."
          }
        />
        <div className="social-grid">
          {entries.map((entry) => (
            <EntryCard entry={entry} key={entry.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One entry, as a card.
 *
 * The counts under the description are the point of the card as much as the
 * picture is: they say what opening it is worth - eighteen photographs, two
 * films - rather than leaving a visitor to find out by going in.
 *
 * An entry saved before addresses existed, or one whose address has somehow
 * been cleared, has no page to open. It is still shown, as a card that simply
 * does not lead anywhere, rather than being dropped from the page or made into
 * a link that would land on a missing page.
 */
function EntryCard({ entry }: { entry: SocialWork }) {
  const photos = albumOf(entry);
  const films = filmsOf(entry);
  const cover = mediaUrl(entry.coverImage) ?? photos[0]?.src ?? null;
  const coverAlt = mediaUrl(entry.coverImage)
    ? mediaAlt(entry.coverImage, entry.title)
    : (photos[0]?.alt ?? entry.title);
  const summary = summarize(entry);
  const href = entry.slug ? `/social-work/${entry.slug}` : null;

  const card = (
    <>
      <div className="social-card-media">
        {cover ? (
          <Image src={cover} alt={coverAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 33vw" />
        ) : (
          <span className="social-card-emblem" aria-hidden="true">
            <HeartHandshake />
          </span>
        )}
      </div>
      <div className="social-card-body">
        <h3>{entry.title}</h3>
        {summary ? <p>{summary}</p> : null}
        <div className="social-card-counts">
          {photos.length > 0 ? (
            <span>
              <Images aria-hidden="true" />
              {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
            </span>
          ) : null}
          {films.length > 0 ? (
            <span>
              <Film aria-hidden="true" />
              {films.length} {films.length === 1 ? "film" : "films"}
            </span>
          ) : null}
        </div>
        {href ? (
          <span className="social-card-action">
            See the whole story <ArrowRight aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </>
  );

  if (!href) return <article className="social-card social-card--flat">{card}</article>;

  return (
    <Link className="social-card" href={href}>
      {card}
    </Link>
  );
}

/**
 * One entry in full, on a page of its own: the description, then every film,
 * then the whole album.
 *
 * The films come before the photographs because a film is the thing a visitor
 * is least likely to scroll far enough to find, and because an album of forty
 * photographs would otherwise bury them.
 */
export function SocialWorkEntry({ entry }: { entry: SocialWork }) {
  const photos = albumOf(entry);
  const films = filmsOf(entry);
  const cover = mediaUrl(entry.coverImage);
  const date = entry.date ? new Date(entry.date) : null;

  return (
    <article className="social-entry social-entry--page">
      <header className="social-entry-head">
        <span className="social-entry-icon" aria-hidden="true">
          <HeartHandshake />
        </span>
        <div>
          <h1>{entry.title}</h1>
          {date ? (
            <time dateTime={date.toISOString()} className="social-entry-date">
              {date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </time>
          ) : null}
        </div>
      </header>

      {entry.description ? (
        <div className="social-entry-copy">
          {entry.description
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      ) : null}

      {cover ? (
        <figure className="social-cover">
          <Image src={cover} alt={mediaAlt(entry.coverImage, entry.title)} width={1180} height={620} priority />
        </figure>
      ) : null}

      {films.length > 0 ? (
        <div className="social-videos">
          {films.map((video, index) => {
            const title = video.title || entry.title;
            return (
              <figure className="social-video-item" key={video.id ?? `${video.videoId}-${index}`}>
                {/* A film a visitor can play should also be a film a search
                    engine can list, so each one describes itself. */}
                <StructuredData
                  data={{
                    "@context": "https://schema.org",
                    "@type": "VideoObject",
                    name: title,
                    description: video.description || entry.description || undefined,
                    embedUrl: youtubeEmbedUrl(video.videoId),
                    url: youtubeWatchUrl(video.videoId),
                    thumbnailUrl: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
                    uploadDate: entry.date || entry.createdAt,
                    publisher: { "@id": `${siteUrl}/#organization` },
                  }}
                />
                {video.title ? <h2>{video.title}</h2> : null}
                <div className="social-video">
                  <iframe
                    src={youtubeEmbedUrl(video.videoId)}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                {video.description ? <figcaption>{video.description}</figcaption> : null}
                <a
                  className="text-link"
                  href={youtubeWatchUrl(video.videoId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch on YouTube <ArrowUpRight aria-hidden="true" />
                </a>
              </figure>
            );
          })}
        </div>
      ) : null}

      <PhotoAlbum photos={photos} />
    </article>
  );
}
