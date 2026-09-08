import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Clapperboard, GraduationCap, Megaphone, Newspaper, Search } from "lucide-react";
import { getMediaSlot, getPlacedMedia } from "@/lib/content";
import { slotFilm, slotPhoto, type SlotFilm } from "@/lib/page-media";
import { heroSlotKey } from "@/lib/site-map";
import type { CategoryView, ServiceView } from "@/lib/services";
import { absoluteUrl, siteUrl } from "../_lib/seo";
import { StructuredData } from "./structured-data";

/** Icon names come from the category record in the dashboard. */
export const categoryIcons: Record<string, typeof Clapperboard> = {
  clapperboard: Clapperboard,
  megaphone: Megaphone,
  graduationCap: GraduationCap,
  search: Search,
  camera: Camera,
  newspaper: Newspaper,
};

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const crumbs = [{ label: "Home", href: "/" }, ...items];
  return <>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{crumbs.map((item, index) => <li key={item.href}>{index === crumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}</li>)}</ol></nav>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: absoluteUrl(item.href) })) }} />
  </>;
}

/**
 * The band at the top of every page a visitor reads.
 *
 * The right-hand side of it holds a photograph, uploaded into the
 * "<page>-hero" entry of Content → Page media. Until one is uploaded there is
 * nothing there at all: the heading and its words take the full width, rather
 * than sitting beside an empty blue emblem standing in for a picture nobody has
 * added yet.
 *
 * `mediaKey` is the page's Page media key - the page's own key, or a service's
 * slug. A page without one simply never carries a hero photograph.
 */
export async function PageHero({ eyebrow, title, description, path, label, parent, category, mediaKey, children }: { eyebrow: string; title: string; description: string; path: string; label: string; parent?: { label: string; href: string }; category?: CategoryView; mediaKey?: string; children?: React.ReactNode }) {
  const photo = mediaKey ? slotPhoto(await getMediaSlot(heroSlotKey(mediaKey)), title) : null;
  return <section className={`page-hero${category ? ` page-hero-${category.id}` : ""}`}>
    <Image className="page-hero-image" src="/images/nepal-himalayas-dawn-4k.jpg" alt="Himalayan peaks at dawn in Nepal" fill sizes="100vw" priority quality={88} />
    <div className="page-hero-shade" />
    <div className="site-container page-hero-inner">
      <Breadcrumbs items={[...(parent ? [parent] : []), { label, href: path }]} />
      <div className={`page-hero-grid${photo ? "" : " page-hero-grid--wide"}`}>
        <div><span className="hero-kicker"><i />{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children && <div className="hero-actions">{children}</div>}</div>
        {photo ? <figure className="page-hero-photo">
          <div className="page-hero-photo-frame"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 900px) 100vw, 260px" /></div>
          {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        </figure> : null}
      </div>
    </div>
  </section>;
}

export function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return <div className="section-heading"><span className="eyebrow"><i />{kicker}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function ServiceCards({ services }: { services: ServiceView[] }) {
  return <div className="service-detail-grid">{services.map((service) => {
    const Icon = categoryIcons[service.category.icon] || Camera;
    return <Link className="service-detail-card" href={`/services/${service.slug}`} key={service.slug}>
      <span className="service-card-icon"><Icon aria-hidden="true" /></span>
      <h3>{service.title}</h3><p>{service.description}</p><span className="service-card-action">Explore service <ArrowRight aria-hidden="true" /></span>
    </Link>;
  })}</div>;
}

/** A plain grid of named subjects, used by the discipline pages. */
export function TopicGrid({ items }: { items: { title: string; text: string }[] }) {
  return <div className="topic-grid">{items.map(({ title, text }) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>;
}

export function ProcessSteps({ steps }: { steps: [string, string][] }) {
  return <ol className="process-list">{steps.map(([title, description], index) => <li key={title}><span className="process-number">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>;
}

export function Questions({ items }: { items: [string, string][] }) {
  return <div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>;
}

/**
 * One film, played the way it was given to us: an uploaded or linked file in
 * the browser's own player, a YouTube link in YouTube's privacy-enhanced embed.
 */
function Film({ film }: { film: SlotFilm }) {
  if (film.kind === "youtube") {
    return <div className="media-embed">
      <iframe src={film.src} title={film.title} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
    </div>;
  }

  return <video controls playsInline preload="none" poster={film.poster || undefined} aria-label={film.title}>
    <source src={film.src} />
    <p>Your browser cannot play this video. <a href={film.src}>Download the video</a>.</p>
  </video>;
}

/** One file from the library, as much of it as the band draws. */
type PlacedFile = Awaited<ReturnType<typeof getPlacedMedia>>[number];

/** A library entry whose upload finished, so there is something to draw. */
type ReadyFile = PlacedFile & { url: string };

const isReady = (file: PlacedFile): file is ReadyFile => Boolean(file.url);

/**
 * Anything in Content → Media that an editor published to this page, shown
 * under the band's frames. Uploading a photograph and ticking the page is all
 * it takes; nothing else has to point at the file.
 */
function PlacedMedia({ files }: { files: ReadyFile[] }) {
  if (files.length === 0) return null;

  return (
    <div className="media-album">
      {files.map((file) => {
        const caption = file.credit || file.alt;
        return (
          <figure key={file.id}>
            {file.mimeType?.startsWith("video/") ? (
              <video controls playsInline preload="none" aria-label={file.alt}>
                <source src={file.url} type={file.mimeType} />
                <p>
                  Your browser cannot play this video. <a href={file.url}>Download the video</a>.
                </p>
              </video>
            ) : (
              <Image
                src={file.url}
                alt={file.alt}
                width={file.width ?? 640}
                height={file.height ?? 480}
              />
            )}
            {caption ? <figcaption>{caption}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}

/**
 * The "in pictures & film" band.
 *
 * It draws nothing at all until something has been uploaded for this page. An
 * empty band used to show two captioned blue rectangles promising photographs
 * "coming soon", which is an odd thing for a visitor to be told on nine pages
 * at once - so now a page with no pictures simply has no picture band, and the
 * band appears the moment the first photograph or film is saved.
 *
 * Half-filled is fine: a page with a photograph and no film shows the
 * photograph on its own rather than beside an apology for the missing film.
 *
 * `placement` is the page the band is on. Files in Content → Media published to
 * that page join the band underneath, so a photograph reaches the website
 * without an editor having to find something to attach it to - and they count
 * towards whether the band appears at all.
 */
export async function MediaShowcase({
  mediaKey,
  title,
  placement = null,
}: {
  mediaKey: string;
  title: string;
  placement?: string | null;
}) {
  const [slot, placed] = await Promise.all([getMediaSlot(mediaKey), getPlacedMedia(placement)]);
  const image = slotPhoto(slot, title);
  const film = slotFilm(slot, title);
  // A library entry whose upload never finished has nothing to draw, so it does
  // not count towards the band appearing and is not counted into the album.
  const files = placed.filter(isReady);

  // Nothing uploaded anywhere for this page: no band, no heading, no gap.
  if (!image && !film && files.length === 0) return null;

  // One frame on its own is centred rather than left hanging in half a grid.
  const frames = [image, film].filter(Boolean).length;

  return <section className="content-section media-section"><div className="site-container">
    <SectionHeading kicker="In focus" title={`${title} in pictures & film`} description="A space for images and films from our work." />
    {frames > 0 ? <div className={`media-showcase-grid${frames === 1 ? " media-showcase-grid--one" : ""}`}>
      {image ? <figure className="media-frame">
        <div className="media-photo"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
        {image.caption ? <figcaption>{image.caption}</figcaption> : null}
      </figure> : null}
      {film ? <figure className="media-frame">
        <Film film={film} />
        {film.description ? <figcaption>{film.description}</figcaption> : null}
        {film.transcript ? <details className="video-transcript"><summary>Read video transcript</summary><p>{film.transcript}</p></details> : null}
        <StructuredData data={{ "@context": "https://schema.org", "@type": "VideoObject", name: film.title, description: film.description || undefined, thumbnailUrl: film.poster ? absoluteUrl(film.poster) : undefined, ...(film.kind === "youtube" ? { embedUrl: film.src, url: film.watchUrl ?? undefined } : { contentUrl: absoluteUrl(film.src) }), uploadDate: film.uploadDate || undefined, duration: film.duration || undefined, publisher: { "@id": `${siteUrl}/#organization` } }} />
      </figure> : null}
    </div> : null}
    <PlacedMedia files={files} />
  </div></section>;
}

export function ContactCta({ title = "Let’s make something meaningful.", description = "Tell us about your audience, your idea, and what you want to communicate.", service }: { title?: string; description?: string; service?: string }) {
  return <section className="contact-cta"><div className="site-container contact-cta-inner"><div><span className="section-kicker">Your next step</span><h2>{title}</h2><p>{description}</p></div><Link className="hero-cta" prefetch={false} href={service ? `/contact?service=${encodeURIComponent(service)}` : "/contact"}>Start a conversation <ArrowUpRight aria-hidden="true" /></Link></div></section>;
}
