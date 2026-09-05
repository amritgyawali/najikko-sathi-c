import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Clapperboard, GraduationCap, ImageIcon, Megaphone, Newspaper, Play, Search } from "lucide-react";
import { business } from "../_data/site";
import { pageMedia } from "../_data/media";
import { getMediaSlot } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
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

export function PageHero({ eyebrow, title, description, path, label, parent, category, children }: { eyebrow: string; title: string; description: string; path: string; label: string; parent?: { label: string; href: string }; category?: CategoryView; children?: React.ReactNode }) {
  const Icon = (category && categoryIcons[category.icon]) || Camera;
  return <section className={`page-hero${category ? ` page-hero-${category.id}` : ""}`}>
    <Image className="page-hero-image" src="/images/nepal-himalayas-dawn-4k.jpg" alt="Himalayan peaks at dawn in Nepal" fill sizes="100vw" priority quality={88} />
    <div className="page-hero-shade" />
    <div className="site-container page-hero-inner">
      <Breadcrumbs items={[...(parent ? [parent] : []), { label, href: path }]} />
      <div className="page-hero-grid">
        <div><span className="hero-kicker"><i />{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children && <div className="hero-actions">{children}</div>}</div>
        <div className="page-hero-emblem" aria-hidden="true"><Icon /><span>{business.initials}</span><small>{category ? category.label : "Your media partner"}</small></div>
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

export function ProcessSteps({ steps }: { steps: [string, string][] }) {
  return <ol className="process-list">{steps.map(([title, description], index) => <li key={title}><span className="process-number">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>;
}

export function Questions({ items }: { items: [string, string][] }) {
  return <div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>;
}

export async function MediaShowcase({ mediaKey, title }: { mediaKey: string; title: string }) {
  // A photo uploaded in the dashboard wins; the static table is the fallback
  // for anything that has not been filled in there yet.
  const slot = await getMediaSlot(mediaKey);
  const uploaded = mediaUrl(slot?.image);
  const fallback = pageMedia[mediaKey];

  const image = uploaded
    ? {
        src: uploaded,
        alt: (typeof slot?.image === "object" && slot?.image?.alt) || title,
        caption: slot?.caption || "",
      }
    : fallback?.image;

  const video = slot?.video?.src
    ? {
        src: slot.video.src,
        poster: slot.video.poster ?? "",
        title: slot.video.title || title,
        description: slot.video.description ?? "",
        captions: "",
        transcript: slot.video.transcript ?? "",
        uploadDate: slot.video.uploadDate ?? "",
        duration: slot.video.duration ?? "",
      }
    : fallback?.video;

  return <section className="content-section media-section"><div className="site-container">
    <SectionHeading kicker="In focus" title={`${title} in pictures & film`} description="A space for images and films from our work." />
    <div className="media-showcase-grid">
      <figure className="media-frame">
        {image ? <><div className="media-photo"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>{image.caption ? <figcaption>{image.caption}</figcaption> : null}</> : <><div className="media-placeholder"><ImageIcon aria-hidden="true" /><span>Photography</span><strong>{title}</strong><small>Photos coming soon</small></div><figcaption>Photography will be added to this page.</figcaption></>}
      </figure>
      <figure className="media-frame">
        {video ? <><video controls playsInline preload="none" poster={video.poster} aria-label={video.title}><source src={video.src} type="video/mp4" />{video.captions ? <track default kind="captions" src={video.captions} srcLang="en" label="English" /> : null}<p>Your browser cannot play this video. <a href={video.src}>Download the video</a>.</p></video><figcaption>{video.description}</figcaption>{video.transcript ? <details className="video-transcript"><summary>Read video transcript</summary><p>{video.transcript}</p></details> : null}<StructuredData data={{ "@context": "https://schema.org", "@type": "VideoObject", name: video.title, description: video.description, thumbnailUrl: video.poster ? absoluteUrl(video.poster) : undefined, contentUrl: absoluteUrl(video.src), uploadDate: video.uploadDate, duration: video.duration, publisher: { "@id": `${siteUrl}/#organization` } }} /></> : <><div className="media-placeholder video-placeholder"><Play aria-hidden="true" /><span>Film & video</span><strong>{title}</strong><small>Video coming soon</small></div><figcaption>A video will be added when available.</figcaption></>}
      </figure>
    </div>
  </div></section>;
}

export function ContactCta({ title = "Let’s make something meaningful.", description = "Tell us about your audience, your idea, and what you want to communicate.", service }: { title?: string; description?: string; service?: string }) {
  return <section className="contact-cta"><div className="site-container contact-cta-inner"><div><span className="section-kicker">Your next step</span><h2>{title}</h2><p>{description}</p></div><Link className="hero-cta" prefetch={false} href={service ? `/contact?service=${encodeURIComponent(service)}` : "/contact"}>Start a conversation <ArrowUpRight aria-hidden="true" /></Link></div></section>;
}
