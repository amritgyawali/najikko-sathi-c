import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getBusiness, getHomepage } from "@/lib/content";
import { ContactCta, MediaShowcase, PageHero, SectionHeading } from "../_components/page-content";
import { SancharBand } from "../_components/site-sections";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata("Right Sanchar | Our Digital News Portal", "Discover Right Sanchar, Najikko Sathi Media's digital news portal focused on truthful reporting, public-interest stories, commentary, and investigations in Nepal.", "/right-sanchar");

export default async function RightSancharPage() {
  const [business, home] = await Promise.all([getBusiness(), getHomepage()]);
  return <>
    <PageHero eyebrow="Our digital news portal" title="Right information. Right time. Right perspective." description="Right Sanchar is our platform for accurate, truthful, and unbiased information on issues that matter to the public." path="/right-sanchar" label="Right Sanchar"><a className="hero-cta" href={business.rightSanchar} target="_blank" rel="noopener noreferrer">Read Right Sanchar <ArrowUpRight aria-hidden="true" /></a></PageHero>
    <SancharBand business={business} home={home} />
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="Our editorial purpose" title="Help people understand what matters." description="News is useful when it offers facts, context, and a way to understand public issues. Right Sanchar brings reporting, commentary, and investigative content into one digital platform." /><div className="values-grid"><article><h3>News reporting</h3><p>Coverage of politics, society, the economy, culture, and issues of public interest, with a focus on truthful information and context.</p></article><article><h3>Commentary</h3><p>Perspectives that help audiences consider the meaning of events, alongside a clear distinction between reporting and interpretation.</p></article><article><h3>Investigative content</h3><p>Stories that begin with questions and look for supporting sources, background information, and a deeper understanding of an issue.</p></article></div></div></section>
    <section className="content-section"><div className="site-container portal-next"><div><SectionHeading kicker="Visit the newsroom" title="Find published stories on Right Sanchar." /><p>Open the news portal for its current articles. For a story suggestion or a question about our media work, contact Najikko Sathi directly.</p></div><div className="stacked-actions"><a className="primary-button" href={business.rightSanchar} target="_blank" rel="noopener noreferrer">Open news portal <ArrowUpRight aria-hidden="true" /></a><Link className="text-link" prefetch={false} href="/contact?service=Right%20Sanchar">Share a story suggestion <ArrowRight aria-hidden="true" /></Link></div></div></section>
    <MediaShowcase mediaKey="right-sanchar" title="Right Sanchar" />
    <ContactCta title="A story our audience should know?" description="Share the background and relevant sources with our team." service="Right Sanchar" />
  </>;
}
