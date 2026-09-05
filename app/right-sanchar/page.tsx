import Link from "next/link";
import { ArrowRight, ArrowUpRight, Newspaper } from "lucide-react";
import { business, rightSancharTopics } from "../_data/site";
import { ContactCta, MediaShowcase, PageHero, SectionHeading } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata("Right Sanchar | Our Digital News Portal", "Discover Right Sanchar, Najikko Sathi Media's digital news portal focused on truthful reporting, public-interest stories, commentary, and investigations in Nepal.", "/right-sanchar");

export default function RightSancharPage() {
  return <>
    <PageHero eyebrow="Our digital news portal" title="Right information. Right time. Right perspective." description="Right Sanchar is our platform for accurate, truthful, and unbiased information on issues that matter to the public." path="/right-sanchar" label="Right Sanchar"><a className="hero-cta" href={business.rightSanchar} target="_blank" rel="noopener noreferrer">Read Right Sanchar <ArrowUpRight aria-hidden="true" /></a></PageHero>
    <section className="content-section"><div className="site-container"><div className="right-sanchar-card portal-feature"><div className="right-sanchar-identity"><span className="portal-icon"><Newspaper aria-hidden="true" /></span><span className="portal-label">A Najikko Sathi media platform</span><strong>RIGHT<br />SANCHAR</strong><small>{business.rightSancharLabel}</small></div><div className="topic-cloud">{rightSancharTopics.map((topic) => <span key={topic}>{topic}</span>)}</div></div></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="Our editorial purpose" title="Help people understand what matters." description="News is useful when it offers facts, context, and a way to understand public issues. Right Sanchar brings reporting, commentary, and investigative content into one digital platform." /><div className="values-grid"><article><h3>News reporting</h3><p>Coverage of politics, society, the economy, culture, and issues of public interest, with a focus on truthful information and context.</p></article><article><h3>Commentary</h3><p>Perspectives that help audiences consider the meaning of events, alongside a clear distinction between reporting and interpretation.</p></article><article><h3>Investigative content</h3><p>Stories that begin with questions and look for supporting sources, background information, and a deeper understanding of an issue.</p></article></div></div></section>
    <section className="content-section"><div className="site-container portal-next"><div><SectionHeading kicker="Visit the newsroom" title="Find published stories on Right Sanchar." /><p>Open the news portal for its current articles. For a story suggestion or a question about our media work, contact Najikko Sathi directly.</p></div><div className="stacked-actions"><a className="primary-button" href={business.rightSanchar} target="_blank" rel="noopener noreferrer">Open news portal <ArrowUpRight aria-hidden="true" /></a><Link className="text-link" href="/contact?service=Right%20Sanchar">Share a story suggestion <ArrowRight aria-hidden="true" /></Link></div></div></section>
    <MediaShowcase mediaKey="right-sanchar" title="Right Sanchar" />
    <ContactCta title="A story our audience should know?" description="Share the background and relevant sources with our team." service="Right Sanchar" />
  </>;
}
