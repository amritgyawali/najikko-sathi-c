import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Clapperboard, GraduationCap, ImageIcon, Megaphone, Play, Search } from "lucide-react";
import { business } from "../_data/site";
import { categories, type Service, type ServiceCategory } from "../_data/services";
import { pageMedia } from "../_data/media";
import { absoluteUrl, siteUrl } from "../_lib/seo";
import { StructuredData } from "./structured-data";

export const categoryIcons = { production: Clapperboard, "social-media": Megaphone, training: GraduationCap, research: Search };

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const crumbs = [{ label: "Home", href: "/" }, ...items];
  return <>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{crumbs.map((item, index) => <li key={item.href}>{index === crumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}</li>)}</ol></nav>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: absoluteUrl(item.href) })) }} />
  </>;
}

export function PageHero({ eyebrow, title, description, path, label, parent, category, children }: { eyebrow: string; title: string; description: string; path: string; label: string; parent?: { label: string; href: string }; category?: ServiceCategory; children?: React.ReactNode }) {
  const Icon = category ? categoryIcons[category] : Camera;
  return <section className={`page-hero${category ? ` page-hero-${category}` : ""}`}>
    <Image className="page-hero-image" src="/images/nepal-himalayas-dawn-4k.jpg" alt="Himalayan peaks at dawn in Nepal" fill sizes="100vw" priority quality={88} />
    <div className="page-hero-shade" />
    <div className="site-container page-hero-inner">
      <Breadcrumbs items={[...(parent ? [parent] : []), { label, href: path }]} />
      <div className="page-hero-grid">
        <div><span className="hero-kicker"><i />{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children && <div className="hero-actions">{children}</div>}</div>
        <div className="page-hero-emblem" aria-hidden="true"><Icon /><span>{business.initials}</span><small>{category ? categories.find((item) => item.id === category)?.label : "Your media partner"}</small></div>
      </div>
    </div>
  </section>;
}

export function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return <div className="section-heading"><span className="eyebrow"><i />{kicker}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function ServiceCards({ services }: { services: Service[] }) {
  return <div className="service-detail-grid">{services.map((service) => {
    const Icon = categoryIcons[service.category];
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

export function MediaShowcase({ mediaKey, title }: { mediaKey: string; title: string }) {
  const media = pageMedia[mediaKey];
  return <section className="content-section media-section"><div className="site-container">
    <SectionHeading kicker="In focus" title={`${title} in pictures & film`} description="A space for images and films from our work." />
    <div className="media-showcase-grid">
      <figure className="media-frame">
        {media?.image ? <><div className="media-photo"><Image src={media.image.src} alt={media.image.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div><figcaption>{media.image.caption}</figcaption></> : <><div className="media-placeholder"><ImageIcon aria-hidden="true" /><span>Photography</span><strong>{title}</strong><small>Photos coming soon</small></div><figcaption>Photography will be added to this page.</figcaption></>}
      </figure>
      <figure className="media-frame">
        {media?.video ? <><video controls playsInline preload="none" poster={media.video.poster} aria-label={media.video.title}><source src={media.video.src} type="video/mp4" /><track default kind="captions" src={media.video.captions} srcLang="en" label="English" /><p>Your browser cannot play this video. <a href={media.video.src}>Download the video</a>.</p></video><figcaption>{media.video.description}</figcaption><details className="video-transcript"><summary>Read video transcript</summary><p>{media.video.transcript}</p></details><StructuredData data={{ "@context": "https://schema.org", "@type": "VideoObject", name: media.video.title, description: media.video.description, thumbnailUrl: absoluteUrl(media.video.poster), contentUrl: absoluteUrl(media.video.src), uploadDate: media.video.uploadDate, duration: media.video.duration, publisher: { "@id": `${siteUrl}/#organization` } }} /></> : <><div className="media-placeholder video-placeholder"><Play aria-hidden="true" /><span>Film & video</span><strong>{title}</strong><small>Video coming soon</small></div><figcaption>A video will be added when available.</figcaption></>}
      </figure>
    </div>
  </div></section>;
}

export function ContactCta({ title = "Let’s make something meaningful.", description = "Tell us about your audience, your idea, and what you want to communicate.", service }: { title?: string; description?: string; service?: string }) {
  return <section className="contact-cta"><div className="site-container contact-cta-inner"><div><span className="section-kicker">Your next step</span><h2>{title}</h2><p>{description}</p></div><Link className="hero-cta" href={service ? `/contact?service=${encodeURIComponent(service)}` : "/contact"}>Start a conversation <ArrowUpRight aria-hidden="true" /></Link></div></section>;
}
