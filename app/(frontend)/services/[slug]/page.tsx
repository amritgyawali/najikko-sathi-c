import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, Questions, SectionHeading, ServiceCards } from "../../_components/page-content";
import { StructuredData } from "../../_components/structured-data";
import { getServiceView, getServiceViews } from "@/lib/services";
import { absoluteUrl, pageMetadata, siteUrl } from "../../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




// Services are managed in the dashboard, so a newly added one must be able to
// render on demand rather than 404 until the next deploy.


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const service = await getServiceView((await params).slug);
  if (!service) notFound();
  return pageMetadata(`${service.title} in Nepal`, service.metaDescription, `/services/${service.slug}`);
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, all] = await Promise.all([getServiceView(slug), getServiceViews()]);
  if (!service) notFound();

  const category = service.category;
  const related = all.filter((item) => item.category.id === category.id && item.slug !== service.slug).slice(0, 3);

  return <>
    <PageHero eyebrow={`${category.label} · Kathmandu, Nepal`} title={service.title} description={service.description} path={`/services/${service.slug}`} label={service.shortTitle} parent={{ label: "Services", href: "/services" }} category={category}><Link className="hero-cta" prefetch={false} href={`/contact?service=${encodeURIComponent(service.title)}`}>Discuss this service <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container service-overview"><div className="prose"><SectionHeading kicker="The purpose" title={`A closer look at ${service.shortTitle.toLowerCase()}`} /><p className="lead-copy">{service.intro}</p>{service.audience ? <><h3>Who this is for</h3><p>{service.audience}</p></> : null}{service.preparation ? <><h3>What to prepare</h3><p>{service.preparation}</p></> : null}</div><aside className="scope-card"><span className="section-kicker">The scope</span><h2>What we can work on</h2><ul>{service.deliverables.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul><p>Final deliverables, timing, and fees are confirmed in your project proposal.</p><Link className="text-link" href={category.href}>Explore {category.label.toLowerCase()} <ArrowRight aria-hidden="true" /></Link></aside></div></section>
    {service.steps.length > 0 ? <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="How it comes together" title="A clear path from brief to outcome." /><ProcessSteps steps={service.steps} /></div></section> : null}
    <MediaShowcase mediaKey={service.slug} title={service.shortTitle} />
    {service.faq.length > 0 ? <section className="content-section"><div className="site-container faq-grid"><SectionHeading kicker="Before you begin" title="Useful things to know." /><Questions items={service.faq} /></div></section> : null}
    {related.length > 0 ? <section className="content-section related-section"><div className="site-container"><SectionHeading kicker="Keep exploring" title="Related services" /><ServiceCards services={related} /></div></section> : null}
    <ContactCta service={service.title} title={`Let’s talk about ${service.shortTitle.toLowerCase()}.`} />
    <StructuredData data={[
      { "@context": "https://schema.org", "@type": "Service", "@id": `${absoluteUrl(`/services/${service.slug}`)}#service`, name: service.title, description: service.description, url: absoluteUrl(`/services/${service.slug}`), serviceType: category.title, areaServed: { "@type": "Country", name: "Nepal" }, provider: { "@id": `${siteUrl}/#organization` } },
      ...(service.faq.length > 0 ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: service.faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }] : []),
    ]} />
  </>;
}
