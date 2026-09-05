import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContactCta, MediaShowcase, PageHero, SectionHeading, ServiceCards } from "../_components/page-content";
import { StructuredData } from "../_components/structured-data";
import { getCategoryViews, getServiceViews } from "@/lib/services";
import { absoluteUrl, pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata(
  "Media & Creative Services in Nepal",
  "Explore the services offered by Najikko Sathi in Kathmandu: video and photography production, social media management, practical training, and research and development.",
  "/services",
);

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServiceViews(), getCategoryViews()]);
  // Only show groups that actually contain something.
  const populated = categories.filter((category) =>
    services.some((service) => service.category.id === category.id),
  );

  return <>
    <PageHero eyebrow="Our service portfolio" title="One media house. Every part of your story." description="Production, social media, training, and research. Find the right support for what you want to communicate." path="/services" label="Services"><Link className="hero-cta" href="/contact">Discuss your project <ArrowRight aria-hidden="true" /></Link></PageHero>
    <nav className="category-bar" aria-label="Service categories"><div className="site-container">{populated.map((category) => <a key={category.id} href={`#${category.id}`}>{category.label}<span>{services.filter((service) => service.category.id === category.id).length} services</span></a>)}</div></nav>
    {populated.map((category) => <section className={`content-section category-section category-${category.id}`} id={category.id} key={category.id}><div className="site-container"><SectionHeading kicker={category.label} title={category.title} description={category.description} /><ServiceCards services={services.filter((service) => service.category.id === category.id)} /></div></section>)}
    <MediaShowcase mediaKey="services" title="Our services" />
    <ContactCta title="A project can bring several disciplines together." description="Tell us what you need. We can discuss a scope that connects research, production, digital communication, and training." />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Najikko Sathi service portfolio", itemListElement: services.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.title, url: absoluteUrl(`/services/${service.slug}`) })) }} />
  </>;
}
