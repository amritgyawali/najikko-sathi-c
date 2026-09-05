import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories, servicePortfolio } from "../_data/services";
import { ContactCta, MediaShowcase, PageHero, SectionHeading, ServiceCards } from "../_components/page-content";
import { StructuredData } from "../_components/structured-data";
import { absoluteUrl, pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata("Media & Creative Services in Nepal", "Explore 16 services from Najikko Sathi in Kathmandu: video and photography production, social media management, practical training, and research and development.", "/services");

export default function ServicesPage() {
  return <>
    <PageHero eyebrow="Our service portfolio" title="One media house. Every part of your story." description="Production, social media, training, and research. Find the right support for what you want to communicate." path="/services" label="Services"><Link className="hero-cta" href="/contact">Discuss your project <ArrowRight aria-hidden="true" /></Link></PageHero>
    <nav className="category-bar" aria-label="Service categories"><div className="site-container">{categories.map((category) => <a key={category.id} href={`#${category.id}`}>{category.label}<span>{servicePortfolio.filter((service) => service.category === category.id).length} services</span></a>)}</div></nav>
    {categories.map((category) => <section className={`content-section category-section category-${category.id}`} id={category.id} key={category.id}><div className="site-container"><SectionHeading kicker={category.label} title={category.title} description={category.description} /><ServiceCards services={servicePortfolio.filter((service) => service.category === category.id)} /></div></section>)}
    <MediaShowcase mediaKey="services" title="Our services" />
    <ContactCta title="A project can bring several disciplines together." description="Tell us what you need. We can discuss a scope that connects research, production, digital communication, and training." />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Najikko Sathi service portfolio", itemListElement: servicePortfolio.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.title, url: absoluteUrl(`/services/${service.slug}`) })) }} />
  </>;
}
