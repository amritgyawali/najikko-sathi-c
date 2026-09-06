import Image from "next/image";
import { ArrowUpRight, HeartHandshake } from "lucide-react";

import { getSocialResponsibility } from "@/lib/content";
import { onPage } from "@/lib/placements";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { youtubeEmbedUrl, youtubeId, youtubeWatchUrl } from "@/lib/youtube";
import { siteUrl } from "../_lib/seo";
import { SectionHeading } from "./page-content";
import { StructuredData } from "./structured-data";

/**
 * The social responsibility work, as entered in the dashboard. Every entry may
 * carry a YouTube film, a photo album, or both, so an editor adds a video by
 * pasting its link and an album by uploading photographs. Nothing here is
 * hard-coded, and the section disappears entirely while it is empty.
 */
export async function SocialResponsibilitySection({
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
  const entries = onPage(await getSocialResponsibility(), placement);
  if (entries.length === 0) return null;

  return (
    <section className="content-section social-section" id="social-responsibility">
      <div className="site-container">
        <SectionHeading
          kicker={kicker || "Social responsibility"}
          title={heading || "The work we do beyond our clients."}
          description={
            description ||
            "Films and photographs from the community work we take part in, alongside the organizations and people it is made with."
          }
        />
        <div className="social-entries">
          {entries.map((entry) => {
            const videoId = youtubeId(entry.youtubeUrl);
            const photos = (entry.photos ?? []).filter((photo) => mediaUrl(photo.image));

            return (
              <article className="social-entry" key={entry.id}>
                <header className="social-entry-head">
                  <span className="social-entry-icon" aria-hidden="true"><HeartHandshake /></span>
                  <div>
                    <h3>{entry.title}</h3>
                    {entry.summary ? <p>{entry.summary}</p> : null}
                  </div>
                </header>
                {videoId ? (
                  <div className="social-video">
                    {/* A film a visitor can play should also be a film a search
                        engine can list, so each one describes itself. */}
                    <StructuredData
                      data={{
                        "@context": "https://schema.org",
                        "@type": "VideoObject",
                        name: entry.title,
                        description: entry.summary || undefined,
                        embedUrl: youtubeEmbedUrl(videoId),
                        url: youtubeWatchUrl(videoId),
                        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        uploadDate: entry.date || entry.createdAt,
                        publisher: { "@id": `${siteUrl}/#organization` },
                      }}
                    />
                    <iframe
                      src={youtubeEmbedUrl(videoId)}
                      title={entry.title}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
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
                {videoId ? (
                  <a className="text-link" href={youtubeWatchUrl(videoId)} target="_blank" rel="noreferrer">
                    Watch on YouTube <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
