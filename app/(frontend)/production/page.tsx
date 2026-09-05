import Link from "next/link";
import { ArrowRight, Camera, Clapperboard, FileText, Scissors, Search } from "lucide-react";
import { getCategoryViews, getFaqPairs, getServiceViews } from "@/lib/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, Questions, SectionHeading, ServiceCards } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata("Video & Documentary Production in Nepal", "Explore biography films, documentaries, commercials, and corporate profiles with Najikko Sathi's photography and video production team in Kathmandu, Nepal.", "/production");

export default async function ProductionPage() {
  const [services, categories, questions] = await Promise.all([
    getServiceViews(),
    getCategoryViews(),
    getFaqPairs("production", [
      ["What should a production brief include?", "Share the subject, intended audience, desired format, locations, deadline, and available budget range. Existing photographs, reports, brand guidelines, and references can help define the scope."],
      ["Can photography and video be combined?", "Yes. The portfolio covers both photography and videography. The brief should list the photographs and films needed so the coverage and delivery can be coordinated."],
      ["Are prices and timelines fixed?", "No fixed packages are published here. Research, filming locations, contributors, duration, editing, and language versions affect the proposal."],
    ]),
  ]);
  const category = categories.find((item) => item.id === "production");
  return <>
    <PageHero eyebrow="Photography & video production" title="Real stories. Thoughtfully brought to life." description="From a personal biography to an institutional documentary, we connect research and cinematic craft with the purpose of your story." path="/production" label="Production" category={category}><Link className="hero-cta" href="/contact?service=Production">Start a production <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container foundation-grid"><div className="foundation-image-wrap"><div className="foundation-backplate" /><div className="production-visual"><Clapperboard className="production-camera" aria-hidden="true" /><div className="production-steps">{[{ icon: Search, label: "Research" }, { icon: FileText, label: "Script" }, { icon: Camera, label: "Shoot" }, { icon: Scissors, label: "Edit" }].map(({ icon: Icon, label }) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}</div></div></div><div className="prose"><SectionHeading kicker="The whole story" title="From the first question to the final edit." /><p>Our production portfolio covers biographies, documentary films, advertisements, and organizational profiles. Photography and videography help give each subject a clear, memorable visual form.</p><p>The starting point is your audience and intended use. A screening, a website introduction, a television placement, and a social campaign each need a different approach to duration, framing, and delivery.</p></div></div></section>
    <section className="content-section related-section"><div className="site-container"><SectionHeading kicker="Find your format" title="Four ways to tell your story." /><ServiceCards services={services.filter((service) => service.category.id === "production")} /></div></section>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Our production process" title="Research. Script. Shoot. Edit." /><ProcessSteps steps={[["Research", "Understand the subject, gather background information, and identify the voices and locations that matter."], ["Script", "Shape the narrative, agree on the message, and plan what needs to be captured."], ["Shoot", "Record interviews, visual details, and supporting material within the agreed production plan."], ["Edit", "Bring the story together and prepare the formats agreed for your audience and channels."]]} /></div></section>
    <MediaShowcase mediaKey="production" title="Our production work" />
    <section className="content-section"><div className="site-container faq-grid"><SectionHeading kicker="Plan your production" title="Before the camera rolls." /><Questions items={questions} /></div></section>
    <ContactCta title="What story do you want to tell?" service="Production" />
  </>;
}
