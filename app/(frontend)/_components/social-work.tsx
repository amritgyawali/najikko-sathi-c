import Image from "next/image";
import { ArrowUpRight, HeartHandshake } from "lucide-react";

import type { SocialWork } from "@/payload-types";
import { getSocialWork } from "@/lib/content";
import { onPage } from "@/lib/placements";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { youtubeEmbedUrl, youtubeId, youtubeWatchUrl } from "@/lib/youtube";
import { siteUrl } from "../_lib/seo";
import { SectionHeading } from "./page-content";
import { StructuredData } from "./structured-data";

/**
 * The social work, as entered in the dashboard.
 *
 * Every entry carries a title, a description, any number of photographs and any
 * number of YouTube films - each film with a title and a description of its
 * own. All of it is uploaded in Content → Social Work, so adding a project,
 * replacing a photograph or dropping a video never needs a deploy. Nothing here
 * is hard-coded, and the section disappears entirely while it is empty.
 */
export async function SocialWorkSection({
  kicker,
  heading,
  description,
  placement,
}: {
  kicker?: string | null;
  heading?: string | null;
  description?: string | null;
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
          title={heading || "The work we do beside our communities."}
          description={
            description ||
            "Photographs and films from the social work we take part in, alongside the people and organizations it is done with."
          }
        />
        <div className="social-entries">
          {entries.map((entry) => (
            <Entry entry={entry} key={entry.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Entry({ entry }: { entry: SocialWork }) {
  const cover = mediaUrl(entry.coverImage);
  const photos = (entry.photos ?? []).filter((photo) => mediaUrl(photo.image));
  // A link that is not a YouTube video would render an empty player, so it is
  // dropped here rather than shown as a blank frame.
  const videos = (entry.videos ?? [])
    .map((video) => ({ ...video, videoId: youtubeId(video.youtubeUrl) }))
    .filter((video): video is typeof video & { videoId: string } => Boolean(video.videoId));

  return (
    <article className="social-entry">
      <header className="social-entry-head">
        <span className="social-entry-icon" aria-hidden="true">
          <HeartHandshake />
        </span>
        <div>
          <h3>{entry.title}</h3>
          {entry.description ? <p>{entry.description}</p> : null}
        </div>
      </header>

      {cover ? (
        <figure className="social-cover">
          <Image
            src={cover}
            alt={mediaAlt(entry.coverImage, entry.title)}
            width={1180}
            height={620}
          />
        </figure>
      ) : null}

      {videos.length > 0 ? (
        <div className="social-videos">
          {videos.map((video, index) => {
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
                {video.title ? <h4>{video.title}</h4> : null}
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

      {photos.length > 0 ? (
        <div className="social-album">
          {photos.map((photo) => (
            <figure key={photo.id ?? mediaUrl(photo.image)}>
              <Image
                src={mediaUrl(photo.image)!}
                alt={mediaAlt(photo.image, photo.caption || entry.title)}
                width={640}
                height={430}
              />
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : null}
    </article>
  );
}
