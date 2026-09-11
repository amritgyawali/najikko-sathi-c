import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Clapperboard, GraduationCap, Megaphone, Newspaper, Search } from "lucide-react";
import { getMediaSlot, getPlacedMedia } from "@/lib/content";
import { slotFilm, slotPhoto, type SlotFilm } from "@/lib/page-media";
import { showcaseCopyFor } from "@/lib/showcase-copy";
import { heroSlotKey } from "@/lib/site-map";
import type { CategoryView, ServiceView } from "@/lib/services";
import { absoluteUrl, siteUrl } from "../_lib/seo";
import { StructuredData } from "./structured-data";
import { Written } from "./written";

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
export async function PageHero({ eyebrow, eyebrowNe, title, titleNe, description, descriptionNe, path, label, parent, category, mediaKey, children }: { eyebrow: string; eyebrowNe?: string | null; title: string; titleNe?: string | null; description: string; descriptionNe?: string | null; path: string; label: string; parent?: { label: string; href: string }; category?: CategoryView; mediaKey?: string; children?: React.ReactNode }) {
  const photo = mediaKey ? slotPhoto(await getMediaSlot(heroSlotKey(mediaKey)), title) : null;
  return <section className={`page-hero${category ? ` page-hero-${category.id}` : ""}`}>
    <Image className="page-hero-image" src="/images/nepal-himalayas-dawn-4k.jpg" alt="Himalayan peaks at dawn in Nepal" fill sizes="100vw" priority quality={88} />
    <div className="page-hero-shade" />
    <div className="site-container page-hero-inner">
      <Breadcrumbs items={[...(parent ? [parent] : []), { label, href: path }]} />
      <div className={`page-hero-grid${photo ? "" : " page-hero-grid--wide"}`}>
        <div><span className="hero-kicker"><i /><Written ne={eyebrowNe}>{eyebrow}</Written></span><Written as="h1" ne={titleNe}>{title}</Written><Written as="p" ne={descriptionNe}>{description}</Written>{children && <div className="hero-actions">{children}</div>}</div>
        {photo ? <figure className="page-hero-photo">
          <div className="page-hero-photo-frame"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 900px) 100vw, 260px" /></div>
          {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        </figure> : null}
      </div>
    </div>
  </section>;
}

/**
 * A band's heading. Each of the three lines carries the Nepali written beside
 * it in the dashboard; `translate` is for a title the page builds a sentence
 * out of, where the phrase book still has the turn of phrase to supply.
 */
export function SectionHeading({ kicker, kickerNe, title, titleNe, translateTitle, description, descriptionNe }: { kicker: string; kickerNe?: string | null; title: string; titleNe?: string | null; translateTitle?: boolean; description?: string; descriptionNe?: string | null }) {
  return <div className="section-heading"><span className="eyebrow"><i /><Written ne={kickerNe}>{kicker}</Written></span><Written as="h2" ne={titleNe} translate={translateTitle}>{title}</Written>{description && <Written as="p" ne={descriptionNe}>{description}</Written>}</div>;
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

/** One numbered step, and the Nepali written beside each half of it. */
export type Step = { title: string; titleNe?: string | null; text: string; textNe?: string | null };

export function ProcessSteps({ steps }: { steps: Step[] }) {
  return <ol className="process-list">{steps.map((step, index) => <li key={step.title}><span className="process-number">{String(index + 1).padStart(2, "0")}</span><Written as="h3" ne={step.titleNe}>{step.title}</Written><Written as="p" ne={step.textNe}>{step.text}</Written></li>)}</ol>;
}

/** One question and its answer, each with the Nepali written beside it. */
export type Question = { question: string; questionNe?: string | null; answer: string; answerNe?: string | null };

export function Questions({ items }: { items: Question[] }) {
  return <div className="faq-list">{items.map((item) => <details key={item.question}><summary><Written ne={item.questionNe}>{item.question}</Written></summary><Written as="p" ne={item.answerNe}>{item.answer}</Written></details>)}</div>;
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
 *
 * The label and the line under the heading are per page. They used to be the
 * same two strings everywhere, which on a dozen pages plus every service page
 * described nothing and gave search engines the same paragraph a dozen times.
 * The order is: what the editor typed into this block, then the wording the
 * page ships with in lib/showcase-copy.ts, and no description at all rather
 * than a generic one.
 */
export async function MediaShowcase({
  mediaKey,
  title,
  placement = null,
  kicker,
  kickerNe,
  headingNe,
  description,
  descriptionNe,
  service,
}: {
  mediaKey: string;
  title: string;
  placement?: string | null;
  /** Overrides the label above the heading, from the dashboard. */
  kicker?: string | null;
  /** The Nepali written beside each of them, where somebody has written it. */
  kickerNe?: string | null;
  headingNe?: string | null;
  /** Overrides the line under the heading, from the dashboard. */
  description?: string | null;
  descriptionNe?: string | null;
  /** A service page's short title, which its band describes itself from. */
  service?: string;
}) {
  const [slot, placed] = await Promise.all([getMediaSlot(mediaKey), getPlacedMedia(placement)]);
  const image = slotPhoto(slot, title);
  const film = slotFilm(slot, title);
  const copy = showcaseCopyFor(mediaKey, service);
  // A library entry whose upload never finished has nothing to draw, so it does
  // not count towards the band appearing and is not counted into the album.
  const files = placed.filter(isReady);

  // Nothing uploaded anywhere for this page: no band, no heading, no gap.
  if (!image && !film && files.length === 0) return null;

  // One frame on its own is centred rather than left hanging in half a grid.
  const frames = [image, film].filter(Boolean).length;

  return <section className="content-section media-section"><div className="site-container">
    <SectionHeading
      kicker={kicker?.trim() || copy.kicker}
      kickerNe={kickerNe}
      // The band names itself after the page. A Nepali heading is one part of
      // that sentence rather than the whole of it, so the phrase book is left
      // to turn the sentence round - it knows "X in pictures & film" already.
      title={`${title} in pictures & film`}
      titleNe={headingNe?.trim() ? `${headingNe.trim()} in pictures & film` : null}
      translateTitle
      description={description?.trim() || copy.description}
      descriptionNe={descriptionNe}
    />
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

export function ContactCta({ title = "Let’s make something meaningful.", titleNe, description = "Tell us about your audience, your idea, and what you want to communicate.", descriptionNe, service }: { title?: string; titleNe?: string | null; description?: string; descriptionNe?: string | null; service?: string }) {
  return <section className="contact-cta"><div className="site-container contact-cta-inner"><div><span className="section-kicker">Your next step</span><Written as="h2" ne={titleNe}>{title}</Written><Written as="p" ne={descriptionNe}>{description}</Written></div><Link className="hero-cta" prefetch={false} href={service ? `/contact?service=${encodeURIComponent(service)}` : "/contact"}>Start a conversation <ArrowUpRight aria-hidden="true" /></Link></div></section>;
}
