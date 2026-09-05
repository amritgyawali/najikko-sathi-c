import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { categories, getService, servicePortfolio } from "../../_data/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, Questions, SectionHeading, ServiceCards } from "../../_components/page-content";
import { StructuredData } from "../../_components/structured-data";
import { absoluteUrl, pageMetadata, siteUrl } from "../../_lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return servicePortfolio.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  return pageMetadata(`${service.title} in Nepal`, service.metaDescription, `/services/${service.slug}`);
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const category = categories.find((item) => item.id === service.category)!;
  const related = servicePortfolio.filter((item) => item.category === service.category && item.slug !== service.slug).slice(0, 3);
  return <>
    <PageHero eyebrow={`${category.label} · Kathmandu, Nepal`} title={service.title} description={service.description} path={`/services/${service.slug}`} label={service.shortTitle} parent={{ label: "Services", href: "/services" }} category={service.category}><Link className="hero-cta" href={`/contact?service=${encodeURIComponent(service.title)}`}>Discuss this service <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container service-overview"><div className="prose"><SectionHeading kicker="The purpose" title={`A closer look at ${service.shortTitle.toLowerCase()}`} /><p className="lead-copy">{service.intro}</p><h3>Who this is for</h3><p>{service.audience}</p><h3>What to prepare</h3><p>{service.preparation}</p></div><aside className="scope-card"><span className="section-kicker">The scope</span><h2>What we can work on</h2><ul>{service.deliverables.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul><p>Final deliverables, timing, and fees are confirmed in your project proposal.</p><Link className="text-link" href={category.href}>Explore {category.label.toLowerCase()} <ArrowRight aria-hidden="true" /></Link></aside></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="How it comes together" title="A clear path from brief to outcome." /><ProcessSteps steps={service.steps} /></div></section>
    <MediaShowcase mediaKey={service.slug} title={service.shortTitle} />
    <section className="content-section"><div className="site-container faq-grid"><SectionHeading kicker="Before you begin" title="Useful things to know." /><Questions items={service.faq} /></div></section>
    <section className="content-section related-section"><div className="site-container"><SectionHeading kicker="Keep exploring" title="Related services" /><ServiceCards services={related} /></div></section>
    <ContactCta service={service.title} title={`Let’s talk about ${service.shortTitle.toLowerCase()}.`} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Service", "@id": `${absoluteUrl(`/services/${service.slug}`)}#service`, name: service.title, description: service.description, url: absoluteUrl(`/services/${service.slug}`), serviceType: category.title, areaServed: { "@type": "Country", name: "Nepal" }, provider: { "@id": `${siteUrl}/#organization` } }} />
  </>;
}
