import type { Page } from "@/payload-types";

/**
 * The content every built-in page ships with.
 *
 * This is the copy the website used to hold inside its route files. It lives
 * here as data so that one list can do three jobs:
 *
 * 1. The website renders it, for anyone who has not imported the page into the
 *    dashboard yet - or who has deleted it again.
 * 2. The dashboard imports it, turning a built-in page into an ordinary Page
 *    document whose every word can be edited (cms/endpoints/sync-pages.ts).
 * 3. `npm run check:pages` checks it against lib/site-map.ts, so a page can
 *    never exist in one list and not the other.
 *
 * Editing a page in the dashboard therefore replaces what is written here;
 * deleting it there brings this back.
 */

export type PageSection = NonNullable<Page["layout"]>[number];

export type RoutePageContent = {
  /** Search-engine title and description, before anything is overridden. */
  seo: { title: string; description: string };
  /** Keep this page out of search results. */
  noindex?: boolean;
  /** The page, top to bottom. */
  sections: PageSection[];
};

const paragraphs = (...items: string[]) => items.map((text) => ({ text }));
const points = (...items: string[]) => items.map((text) => ({ text }));
const chips = (...items: string[]) => items.map((text) => ({ text }));

/** The closing band. Every page but the contact page ends with one. */
const contactCta = (
  heading: string,
  description?: string,
  service?: string,
): PageSection => ({
  blockType: "contactCta",
  heading,
  ...(description ? { description } : {}),
  ...(service ? { service } : {}),
});

/**
 * A photo & film band.
 *
 * `kicker` and `description` are left unset on purpose: the wording each page
 * uses lives in lib/showcase-copy.ts, keyed by the same media key, so a page
 * already imported into the dashboard picks it up without being re-edited.
 * Setting either here would freeze a copy of that wording into the page
 * document instead.
 */
const mediaShowcase = (mediaKey: string, heading: string): PageSection => ({
  blockType: "mediaShowcase",
  mediaKey,
  heading,
});

export const routePageContent: Record<string, RoutePageContent> = {
  "/": {
    seo: {
      title: "Media House in Kathmandu, Nepal",
      description:
        "Najikko Sathi Media offers documentary and video production, social media management, media training, and research from Anamnagar, Kathmandu, Nepal.",
    },
    sections: [
      { blockType: "homeHero", showMediaSystem: true },
      {
        blockType: "homeAbout",
        linkLabel: "Explore Our Services",
        linkHref: "/services",
        captionTitle: "Your Media Partner",
      },
      { blockType: "leadershipSection" },
      {
        blockType: "reviewsSection",
        kicker: "In their words",
        heading: "What the people we work with say.",
        description:
          "Reviews left by the organizations and individuals whose stories we have helped tell.",
        source: "all",
        limit: 6,
        tone: "plain",
      },
      {
        blockType: "wellWishersSection",
        kicker: "Our well-wishers",
        heading: "The people who stand beside us.",
        description:
          "Advisers, patrons and friends of the house whose encouragement keeps this work moving.",
        tone: "tinted",
      },
      { blockType: "mediaShowcase", mediaKey: "home", heading: "" },
    ],
  },

  "/services": {
    seo: {
      title: "Media & Creative Services in Nepal",
      description:
        "Explore the services offered by Najikko Sathi in Kathmandu: video and photography production, social media management, practical training, and research and development.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Our service portfolio",
        heading: "One media house. Every part of your story.",
        description:
          "Production, social media, training, and research. Find the right support for what you want to communicate.",
        ctaLabel: "Discuss your project",
        ctaHref: "/contact",
      },
      { blockType: "categoryBar", ariaLabel: "Service categories" },
      { blockType: "servicesBand" },
      { blockType: "categoryGroups" },
      contactCta(
        "A project can bring several disciplines together.",
        "Tell us what you need. We can discuss a scope that connects research, production, digital communication, and training.",
      ),
    ],
  },

  "/our-work": {
    seo: {
      title: "Our Work | Production, News, Training & Research",
      description:
        "See the work of Najikko Sathi Media in Kathmandu: documentary and video production, the Right Sanchar news portal, media training programs, social media campaigns, and research.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Our work",
        heading: "The stories, campaigns, and programs behind our name.",
        description:
          "Production, news, training, and research are parts of one media practice. This is where each part of our work leads.",
        ctaLabel: "Discuss a project",
        ctaHref: "/contact?service=Our%20Work",
        category: "production",
      },
      {
        blockType: "featureCards",
        style: "links",
        kicker: "What we work on",
        heading: "Seven areas, one media house.",
        description:
          "Each area has its own page with the scope, process, and the questions worth settling before work begins.",
        cards: [
          {
            icon: "clapperboard",
            title: "Photography & video production",
            text: "Biography films, documentaries, commercials, and organizational profiles, from research through to the final edit.",
            linkLabel: "See this work",
            linkHref: "/production",
          },
          {
            icon: "megaphone",
            title: "Social media handling",
            text: "Profile making, media consulting, and event coverage and management across the platforms your audience already uses.",
            linkLabel: "See this work",
            linkHref: "/social-media-handling",
          },
          {
            icon: "graduationCap",
            title: "Training & capacity building",
            text: "Practical programs in social media, content creation, journalism, photography, editing, and design for individuals and teams.",
            linkLabel: "See this work",
            linkHref: "/training",
          },
          {
            icon: "search",
            title: "Research & development",
            text: "Field research and development work with government, non-governmental, and international organizations across Nepal.",
            linkLabel: "See this work",
            linkHref: "/research",
          },
          {
            icon: "monitorSmartphone",
            title: "Information technology",
            text: "Websites, news portals, and the digital systems behind them, built so the people who own them can keep them running.",
            linkLabel: "See this work",
            linkHref: "/it",
          },
          {
            icon: "speech",
            title: "Advertisement",
            text: "Commercials, digital campaigns, and print and outdoor material, written and produced around one clear message.",
            linkLabel: "See this work",
            linkHref: "/advertisement",
          },
          {
            icon: "newspaper",
            title: "Right Sanchar news portal",
            text: "Our digital news platform for accurate, truthful, and unbiased reporting on issues that matter to the public.",
            linkLabel: "See this work",
            linkHref: "/right-sanchar",
          },
        ],
      },
      {
        blockType: "serviceCards",
        kicker: "Production portfolio",
        heading: "The films and photography we make.",
        source: "category",
        category: "production",
        tone: "tinted",
      },
      {
        blockType: "processSteps",
        kicker: "How a project runs",
        heading: "From the first conversation to what you publish.",
        steps: [
          { title: "Understand", text: "Agree on the audience, the message, and where the finished work will be seen." },
          { title: "Plan", text: "Set the scope, the material to be gathered, and what is needed from your side." },
          { title: "Produce", text: "Film, photograph, write, or teach within the agreed plan." },
          { title: "Deliver", text: "Hand over the formats agreed for your channels, and review the result together." },
        ],
      },
      {
        blockType: "socialResponsibilitySection",
        kicker: "Social responsibility",
        heading: "The work we do beyond our clients.",
        description:
          "Films and photographs from the community work we take part in, alongside the organizations and people it is made with.",
      },
      mediaShowcase("our-work", "Our work"),
      {
        blockType: "faqSection",
        kicker: "Before you brief us",
        heading: "Questions we are often asked.",
        placement: "services",
        items: [
          {
            question: "Can I see examples of previous work?",
            answer:
              "Photographs and films are published on each area's page as they are cleared for release. Where a subject's material is private, we can discuss the approach and scope instead of sharing the finished piece.",
          },
          {
            question: "Can one project combine several areas?",
            answer:
              "Yes. A documentary can sit alongside a social media campaign and a training session for the team that will keep publishing afterwards. Describe the overall goal and the scopes can be planned together.",
          },
          {
            question: "How does a project usually start?",
            answer:
              "With a conversation about your audience, the message, and where the work will be published. That determines the format, the production plan, and what is needed from your side.",
          },
        ],
      },
      contactCta(
        "Tell us what you want to make.",
        "Share your audience, your idea, and the areas of our work it touches.",
        "Our Work",
      ),
    ],
  },

  "/contact": {
    seo: {
      title: "Contact Our Kathmandu Media Team",
      description:
        "Contact Najikko Sathi Media in Anamnagar, Kathmandu for production, social media, training, and research inquiries. Call 9851336187 or email najikkosathi@gmail.com.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Start a conversation",
        heading: "Your idea. Our next conversation.",
        description:
          "Tell us what you want to communicate, create, or learn. We’ll discuss the scope and the next steps with you.",
      },
      {
        blockType: "contactDetails",
        kicker: "Contact directly",
        heading: "Find your close companion in Kathmandu.",
        note: "Please call to arrange a visit and confirm the exact meeting location.",
        linkLabel: "View Anamnagar on map",
        linkHref:
          "https://www.google.com/maps/search/?api=1&query=Anamnagar%2C%20Kathmandu%2C%20Nepal",
        showForm: true,
      },
      {
        blockType: "faqSection",
        kicker: "A useful first message",
        tone: "tinted",
        heading: "Help us understand your project.",
        placement: "contact",
        items: [
          {
            question: "What information should I share?",
            answer:
              "Describe your idea, the intended audience, the service you need, preferred timing, and any relevant budget range. For training, include the topic and group size.",
          },
          {
            question: "Can I request several services together?",
            answer:
              "Yes. A project may combine research, filming, social content, or training. Describe the overall goal so the individual scopes can be discussed together.",
          },
          {
            question: "What happens after I send the form?",
            answer:
              "Your message reaches the Najikko Sathi team directly and is tracked until it is answered. You can also use the direct email address or phone numbers on this page.",
          },
        ],
      },
    ],
  },

  "/about": {
    seo: {
      title: "About Our Kathmandu Media House",
      description:
        "Meet Najikko Sathi Media Pvt. Ltd., a Kathmandu media house connecting truthful journalism, purposeful production, practical training, and social responsibility.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "A close companion in communication",
        heading: "Close to people. Committed to their stories.",
        description:
          "We bring information, entertainment, and social responsibility together through honest communication and purposeful media.",
        ctaLabel: "What we do",
        ctaHref: "/services",
      },
      {
        blockType: "identityStory",
        panelQuote: "One close companion.\nMany ways to communicate.",
        kicker: "Who we are",
        heading: "A media house with a shared purpose.",
        lead: "Najikko Sathi Media Pvt. Ltd. is a multi-dimensional media house based in Anamnagar, Kathmandu. Our work connects truthful information, visual storytelling, advertising, media skills, and community-focused initiatives.",
        paragraphs: paragraphs(
          "Through Right Sanchar, we focus on accurate news, public-interest reporting, commentary, and investigative content. Through our production work, we help people and organizations communicate their stories in photographs, documentaries, biographies, and commercial films.",
          "Our services also extend to social media handling, practical training, and research. These disciplines share a purpose: making communication understandable, useful, and connected to the people it serves.",
        ),
        linkLabel: "Get to know Right Sanchar",
        linkHref: "/right-sanchar",
      },
      {
        blockType: "featureCards",
        style: "values",
        tone: "tinted",
        kicker: "What guides us",
        heading: "Information. Craft. Responsibility.",
        cards: [
          {
            icon: "newspaper",
            title: "Truthful information",
            text: "Reporting and communication should help people understand an issue. Accuracy, context, and an unbiased perspective guide our media purpose.",
          },
          {
            icon: "camera",
            title: "Purposeful storytelling",
            text: "The subject comes first. We connect research, writing, filming, and editing to make a story clear and meaningful for its audience.",
          },
          {
            icon: "heartHandshake",
            title: "Social responsibility",
            text: "Media can support learning and public understanding. Our training and social initiatives reflect a commitment to communities as well as communication.",
          },
        ],
        chips: chips(
          "Honest news",
          "Fact-based reporting",
          "Unbiased perspective",
          "Media production",
          "Skill development",
          "Social responsibility",
        ),
      },
      mediaShowcase("about", "Our media house"),
      { blockType: "teamSection", kicker: "Our people", heading: "The team behind the work." },
      contactCta("Your story starts with a conversation."),
    ],
  },

  "/production": {
    seo: {
      title: "Video & Documentary Production in Nepal",
      description:
        "Explore biography films, documentaries, commercials, and corporate profiles with Najikko Sathi's photography and video production team in Kathmandu, Nepal.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Photography & video production",
        heading: "Real stories. Thoughtfully brought to life.",
        description:
          "From a personal biography to an institutional documentary, we connect research and cinematic craft with the purpose of your story.",
        ctaLabel: "Start a production",
        ctaHref: "/contact?service=Production",
        category: "production",
      },
      { blockType: "productionBand" },
      {
        blockType: "prose",
        kicker: "The whole story",
        heading: "From the first question to the final edit.",
        paragraphs: paragraphs(
          "Our production portfolio covers biographies, documentary films, advertisements, and organizational profiles. Photography and videography help give each subject a clear, memorable visual form.",
          "The starting point is your audience and intended use. A screening, a website introduction, a television placement, and a social campaign each need a different approach to duration, framing, and delivery.",
        ),
      },
      {
        blockType: "featureCards",
        style: "disciplines",
        tone: "tinted",
        kicker: "What we produce",
        heading: "Biography. Documentary. Advertisement.",
        description:
          "Three ways of turning a subject into something an audience will watch, each with its own research, writing, and filming approach.",
        cards: [
          {
            icon: "clapperboard",
            title: "Biography",
            text: "A person's life told as a film. We sit with the subject and the people around them, gather the photographs, letters, and places that carry the story, and shape it into a portrait that a family, an institution, or a public audience can keep.",
            points: points(
              "Interviews with the subject and their circle",
              "Archive photographs and documents filmed and restored on screen",
              "A narrated edit in Nepali, English, or both",
            ),
            linkLabel: "Explore this service",
            linkHref: "/services/biography-videos",
          },
          {
            icon: "film",
            title: "Documentary",
            text: "Longer-form films about an issue, a place, or a piece of work. Research comes first: the question the film asks, the voices that can answer it, and the evidence behind them. Filming and editing then follow that structure rather than a script written in advance.",
            points: points(
              "Field research, sources, and a written treatment",
              "Location filming with contributors and observational footage",
              "Versions cut for screenings, broadcast, and online release",
            ),
            linkLabel: "Explore this service",
            linkHref: "/services/documentary-film-production",
          },
          {
            icon: "megaphone",
            title: "Advertisement",
            text: "Commercials and promotional films built around one clear message. We work from what the product or service actually offers, agree on the single idea the audience should take away, and produce it in the durations each channel needs.",
            points: points(
              "Concept, script, and storyboard agreed before filming",
              "Studio or location production with the required cast and crew",
              "Cut-downs for television, digital campaigns, and social feeds",
            ),
            linkLabel: "Explore this service",
            linkHref: "/services/advertisements-commercials",
          },
        ],
      },
      {
        blockType: "serviceCards",
        kicker: "Find your format",
        heading: "Four ways to tell your story.",
        source: "category",
        category: "production",
      },
      {
        blockType: "processSteps",
        kicker: "Our production process",
        tone: "tinted",
        heading: "Research. Script. Shoot. Edit.",
        steps: [
          {
            title: "Research",
            text: "Understand the subject, gather background information, and identify the voices and locations that matter.",
          },
          { title: "Script", text: "Shape the narrative, agree on the message, and plan what needs to be captured." },
          {
            title: "Shoot",
            text: "Record interviews, visual details, and supporting material within the agreed production plan.",
          },
          {
            title: "Edit",
            text: "Bring the story together and prepare the formats agreed for your audience and channels.",
          },
        ],
      },
      mediaShowcase("production", "Our production work"),
      {
        blockType: "faqSection",
        kicker: "Plan your production",
        heading: "Before the camera rolls.",
        placement: "production",
        items: [
          {
            question: "What should a production brief include?",
            answer:
              "Share the subject, intended audience, desired format, locations, deadline, and available budget range. Existing photographs, reports, brand guidelines, and references can help define the scope.",
          },
          {
            question: "Can photography and video be combined?",
            answer:
              "Yes. The portfolio covers both photography and videography. The brief should list the photographs and films needed so the coverage and delivery can be coordinated.",
          },
          {
            question: "Are prices and timelines fixed?",
            answer:
              "No fixed packages are published here. Research, filming locations, contributors, duration, editing, and language versions affect the proposal.",
          },
        ],
      },
      contactCta("What story do you want to tell?", undefined, "Production"),
    ],
  },

  "/social-media-handling": {
    seo: {
      title: "Social Media Handling & Event Coverage in Nepal",
      description:
        "Profile making, media consulting, and event coverage and management from Najikko Sathi Media in Kathmandu: pages built, content planned, and events covered from start to finish.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Social media handling",
        heading: "Pages that sound like you, run by people who watch them.",
        description:
          "From building a profile to planning what it publishes and covering the events behind it, we handle the parts of digital presence that need doing every week.",
        ctaLabel: "Discuss your pages",
        ctaHref: "/contact?service=Social%20Media%20Handling",
        category: "social-media",
      },
      {
        blockType: "prose",
        kicker: "What handling means",
        heading: "Someone has to answer the messages.",
        lead: "Social media handling is the ordinary, continuous work of keeping a page useful: publishing on a schedule, replying to the people who write in, and noticing when something is or is not landing.",
        paragraphs: paragraphs(
          "We take on as much of that as an organization needs. Some clients want only the setup and a plan they can run themselves; others hand over the calendar, the publishing, and the reporting entirely. Either way the work starts with your audience and the message you are accountable for, not with a platform trend.",
        ),
      },
      {
        blockType: "featureCards",
        style: "disciplines",
        tone: "tinted",
        kicker: "Our scope",
        heading: "Profile making. Media consulting. Event coverage.",
        description:
          "Three strands that can be taken together as an ongoing arrangement, or separately as one-off work.",
        cards: [
          {
            icon: "userRoundPen",
            title: "Profile Making",
            text: "Setting up a page or profile so it says who you are before anyone reads a word of it. We write the biography, prepare the profile and cover imagery, organize the highlights and pinned posts, and put the contact details, links, and verification in place across the platforms you actually use.",
            points: points(
              "Page and profile setup on Facebook, Instagram, YouTube, TikTok, and LinkedIn",
              "Biography, tagline, and about section written for search as well as for readers",
              "Profile photography, cover art, highlight covers, and post templates",
              "A tidy link structure so every profile leads back to your website",
            ),
          },
          {
            icon: "compass",
            title: "Media Consulting",
            text: "Advice on what to publish and why. We look at where your audience already is, what your pages are currently saying, and what the organization needs from them, then agree a content plan, a posting rhythm, and a way of measuring whether it is working.",
            points: points(
              "A review of your existing pages, audience, and reach",
              "A content plan with themes, formats, and a posting calendar",
              "Tone-of-voice and response guidance for comments and messages",
              "Monthly reporting on what the numbers mean and what to change",
            ),
          },
          {
            icon: "calendarCheck",
            title: "Event Coverage and Management",
            text: "Covering an event as it happens and managing how it reaches people afterwards. Our team photographs and films on the day, publishes live updates from your pages, and delivers the edited highlights, stills, and clips your channels need once it is over.",
            points: points(
              "Photography and video coverage for conferences, launches, and ceremonies",
              "Live posting, stories, and updates from your own pages during the event",
              "Highlight films, cut-downs, and a delivered photo album afterwards",
              "Coordination with the organizers, speakers, and press attending",
            ),
          },
        ],
      },
      {
        blockType: "serviceCards",
        kicker: "Related services",
        heading: "The individual scopes in detail.",
        source: "category",
        category: "social-media",
      },
      {
        blockType: "processSteps",
        kicker: "How we work together",
        tone: "tinted",
        heading: "Set it up, agree the plan, keep it running.",
        steps: [
          {
            title: "Review",
            text: "Look at the pages you have, the audience they reach, and what the organization needs them to do.",
          },
          {
            title: "Build",
            text: "Set up or rebuild the profiles, prepare the templates, and agree the tone and the calendar.",
          },
          {
            title: "Publish",
            text: "Produce and post the content, cover the events, and reply to what comes back.",
          },
          { title: "Report", text: "Share what the numbers show each month and adjust the plan around it." },
        ],
      },
      mediaShowcase("social-media-handling", "Social media work"),
      contactCta(
        "Tell us what your pages need to do.",
        "Share the platforms you use, who you are trying to reach, and how much of the work you want to keep in-house.",
        "Social Media Handling",
      ),
    ],
  },

  "/training": {
    seo: {
      title: "Media & Content Creation Training in Nepal",
      description:
        "Explore social media, content creation, journalism, photography, video editing, and creative business training with Najikko Sathi Media in Kathmandu, Nepal.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Training & capacity building",
        heading: "Learn the skills behind meaningful media.",
        description:
          "Practical programs for people who write, report, film, design, and manage digital communication. Start with the skill you want to build.",
        ctaLabel: "Ask about a program",
        ctaHref: "/contact?service=Training",
        category: "training",
      },
      {
        blockType: "featureCards",
        style: "values",
        kicker: "Learning with purpose",
        heading: "Build confidence through practice.",
        description:
          "Training is scoped around the learners, their starting point, and the work they need to do. Individuals, corporate teams, journalists, and creative professionals can discuss a program that fits their goals.",
        cards: [
          {
            icon: "bookOpen",
            title: "Understand the fundamentals",
            text: "Connect the tools with the principles behind clear communication, ethical reporting, and purposeful creative work.",
          },
          {
            icon: "camera",
            title: "Put ideas into practice",
            text: "Work through practical exercises in the chosen discipline, using an agreed set of tools and learning objectives.",
          },
          {
            icon: "users",
            title: "Learn around your needs",
            text: "Discuss group experience, preferred language, devices, and relevant examples when planning the sessions.",
          },
        ],
      },
      {
        blockType: "featureCards",
        style: "topics",
        tone: "tinted",
        kicker: "What we teach",
        heading: "Eleven subjects. One practical foundation.",
        description:
          "Take a single subject or combine several into a longer program. Every subject is taught around exercises you complete and keep.",
        cards: [
          {
            title: "Social Media Handling",
            text: "Running pages and profiles day to day: what to post, when to post it, how to reply, and how to read what the numbers are telling you.",
          },
          {
            title: "Content Creation",
            text: "Turning an idea into something worth publishing - planning, writing, shooting, and packaging content for the channel it is made for.",
          },
          {
            title: "Journalism Basics",
            text: "Reporting fundamentals: finding a story, checking a fact, interviewing a source, and writing it up fairly and clearly.",
          },
          {
            title: "Creativity",
            text: "Practical ways to get past a blank page: observation exercises, references, and building a habit of producing work rather than waiting for inspiration.",
          },
          {
            title: "Idea",
            text: "Shaping a rough thought into a proposal - the audience it is for, the form it should take, and what it needs to become real.",
          },
          {
            title: "Monetization",
            text: "Turning creative work into income: platform programs, sponsorship, client work, pricing, and the record-keeping each of them needs.",
          },
          {
            title: "Photography",
            text: "Camera handling, light, framing, and shooting in the field - stills that carry information as well as mood.",
          },
          {
            title: "Videography",
            text: "Planning a shoot, recording clean audio, moving the camera with purpose, and coming back with footage that can actually be cut together.",
          },
          {
            title: "Editing",
            text: "Assembling a story from rushes: pacing, sound, colour, and delivering the versions each channel needs.",
          },
          {
            title: "Graphic Design",
            text: "Layout, type, and colour for the posters, thumbnails, and templates a page or a campaign runs on.",
          },
          {
            title: "Motion Graphics",
            text: "Titles, lower thirds, and animated explainers that make a film easier to follow.",
          },
        ],
      },
      {
        blockType: "serviceCards",
        kicker: "Choose your direction",
        heading: "Five programs. Practical possibilities.",
        source: "category",
        category: "training",
      },
      {
        blockType: "processSteps",
        kicker: "Plan a program",
        tone: "tinted",
        heading: "Start with what you want to be able to do.",
        steps: [
          {
            title: "Share your goal",
            text: "Tell us the topic, current experience, group size, and preferred learning format.",
          },
          {
            title: "Agree on the program",
            text: "Discuss modules, practical requirements, session duration, availability, and fees.",
          },
          {
            title: "Learn and apply",
            text: "Use guided exercises to connect the learning with the work you want to create.",
          },
        ],
      },
      mediaShowcase("training", "Learning & practice"),
      {
        blockType: "faqSection",
        kicker: "Training questions",
        heading: "Make room for learning.",
        placement: "training",
        items: [
          {
            question: "Can an organization request team training?",
            answer:
              "Yes. Capacity building for corporate teams, journalists, and creative professionals is part of the portfolio. Share the team's responsibilities and learning needs.",
          },
          {
            question: "Are there scheduled batches or certificates?",
            answer:
              "A fixed calendar, accreditation, and certification terms are not published here. Contact the team to confirm the current program details before enrolling.",
          },
          {
            question: "How do I choose a program?",
            answer:
              "Start with the task you want to perform: managing social pages, creating content, reporting, producing visual work, or developing a creative business idea. The individual program pages explain each scope.",
          },
        ],
      },
      contactCta("Tell us what you want to learn.", undefined, "Training"),
    ],
  },

  "/research": {
    seo: {
      title: "Research & Development with GOs, NGOs and INGOs in Nepal",
      description:
        "Najikko Sathi Media carries out field research and development work with government, non-governmental, and international organizations on rural journalism, education, productivity, and rights in Nepal.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Research & development",
        heading: "Evidence gathered where the work actually happens.",
        description:
          "We work with government, non-governmental, and international organizations on research and development - in the field, in the districts, and with the people a program is meant to serve.",
        ctaLabel: "Discuss a study",
        ctaHref: "/contact?service=Research",
        category: "research",
      },
      {
        blockType: "prose",
        kicker: "Who we work with",
        heading: "We work with different GO, NGO, and INGO partners.",
        lead: "Research and development is a standing part of our practice. We work with government organizations, non-governmental organizations, and international organizations - designing the study, collecting the material in the field, and reporting what it shows.",
        paragraphs: paragraphs(
          "Being a media house is what makes this useful rather than duplicative. The same team that collects the data can film the interviews, photograph the sites, and turn the findings into something a community, a donor, and a ministry can each understand. Research that stays in a PDF changes very little.",
        ),
      },
      {
        blockType: "featureCards",
        style: "values",
        tone: "tinted",
        kicker: "Our partners",
        heading: "Three kinds of organization, one way of working.",
        cards: [
          {
            icon: "landmark",
            title: "Government organizations",
            text: "Ministries, departments, provincial and local bodies commissioning field studies, public information campaigns, and documentation of programs already under way.",
          },
          {
            icon: "building2",
            title: "Non-governmental organizations",
            text: "National NGOs working on development, rights, and service delivery, who need evidence gathered in the field and communicated to the people it concerns.",
          },
          {
            icon: "globe2",
            title: "International organizations",
            text: "INGOs and development partners running programs across several districts, where research, monitoring, and reporting have to hold up to external review.",
          },
        ],
      },
      {
        blockType: "featureCards",
        style: "topics",
        kicker: "What we research",
        heading: "Rural journalism, development, and the rights behind them.",
        description:
          "These are the subjects our work returns to most often. A study outside them is worth discussing - the method is the same.",
        cards: [
          {
            title: "Rural Journalism",
            text: "Reporting from outside the capital, and building the capacity of local reporters to cover their own districts. Much of what matters in Nepal is never reported because nobody is there to report it.",
          },
          {
            title: "Development",
            text: "Documenting what development programs actually change on the ground - infrastructure, services, livelihoods - and where the gap sits between what was planned and what people received.",
          },
          {
            title: "Productivity",
            text: "Studies on agricultural and enterprise productivity: what households and small businesses produce, what limits them, and what support has measurably helped.",
          },
          {
            title: "Education",
            text: "School access, attendance, teaching conditions, and the reasons children leave. Research that treats the classroom and the household as parts of the same picture.",
          },
          {
            title: "Human Rights",
            text: "Field research and documentation on rights, access to justice, and the treatment of groups whose experience rarely reaches a public record.",
          },
          {
            title: "Animal Rights",
            text: "The welfare of working, farmed, and stray animals, and the practices, laws, and local initiatives that affect them.",
          },
        ],
      },
      {
        blockType: "serviceCards",
        kicker: "Related services",
        heading: "How a study is scoped.",
        source: "category",
        category: "research",
      },
      {
        blockType: "processSteps",
        kicker: "How a study runs",
        tone: "tinted",
        heading: "Question, field, findings, publication.",
        steps: [
          {
            title: "Frame the question",
            text: "Agree what the study needs to establish, who it is for, and what a useful answer would look like.",
          },
          {
            title: "Design the method",
            text: "Decide the sample, the districts, the instruments, and the consent and safeguarding the subject requires.",
          },
          {
            title: "Collect in the field",
            text: "Interview, observe, photograph, and film, with local researchers who know the area.",
          },
          {
            title: "Report and publish",
            text: "Deliver the written findings and, where it helps, the film and photography that carry them to a wider audience.",
          },
        ],
      },
      mediaShowcase("research", "Research & development"),
      contactCta(
        "Have a study you need carried out?",
        "Tell us the question, the districts involved, and the timeline you are working to.",
        "Research",
      ),
    ],
  },

  "/it": {
    seo: {
      title: "IT, Websites & Digital Systems in Kathmandu, Nepal",
      description:
        "The IT team at Najikko Sathi Media builds websites and news portals, digital systems and applications, and provides hosting, maintenance, and support for organizations in Nepal.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Information technology",
        heading: "The systems that carry the media we make.",
        description:
          "Websites, news portals, and the digital tools behind them - built so the people who own them can keep them running.",
        ctaLabel: "Discuss a project",
        ctaHref: "/contact?service=IT",
      },
      {
        blockType: "prose",
        kicker: "Why a media house has an IT team",
        heading: "Publishing is a technical problem too.",
        lead: "A news portal that goes down during an election, a campaign site that will not load on a phone, and a website whose owner cannot change a phone number without help are all the same problem: media built on systems its own team cannot operate.",
        paragraphs: paragraphs(
          "Our IT work exists to solve that for us and for the organizations we work with. We run Right Sanchar and this website on it, so the tools we hand over are the ones we depend on ourselves - the dashboard, the media library, and the publishing workflow all come from the same practice.",
        ),
      },
      {
        blockType: "featureCards",
        style: "disciplines",
        tone: "tinted",
        kicker: "What we build",
        heading: "Sites, systems, and the support behind them.",
        cards: [
          {
            icon: "layoutDashboard",
            title: "Websites & news portals",
            text: "Websites built to be updated by the people who own them. Every site we hand over comes with a dashboard for the pages, the photographs, and the writing, so publishing something new never means calling us back.",
            points: points(
              "Company websites, news portals, and campaign microsites",
              "A content dashboard for pages, media, and menus",
              "Search-engine basics, sitemaps, and social preview images built in",
              "Fast, readable pages on the phones most of your audience uses",
            ),
          },
          {
            icon: "smartphone",
            title: "Digital systems & applications",
            text: "The tools an organization needs behind the website: enquiry handling, subscriber and member lists, event registration, internal dashboards, and the small pieces of automation that remove repeated manual work.",
            points: points(
              "Enquiry, registration, and record-keeping systems",
              "Reporting dashboards drawn from your own data",
              "Integrations with the platforms and payment services you already use",
              "Data kept where you can export it, in formats you can read",
            ),
          },
          {
            icon: "server",
            title: "Hosting, maintenance & support",
            text: "Keeping what we built running. Domains and certificates renewed on time, backups taken and tested, software updated, and someone reachable when something stops working during an event or a campaign.",
            points: points(
              "Domain, hosting, and certificate management",
              "Automatic backups, with restores actually tested",
              "Security updates and monitoring",
              "A named contact for problems, not a ticket queue",
            ),
          },
        ],
      },
      {
        blockType: "featureCards",
        style: "topics",
        kicker: "How we work",
        heading: "Four things we hold to.",
        cards: [
          {
            title: "Editable by you",
            text: "The point of a dashboard is that nobody has to wait for a developer. If a change to your own website needs a deploy, we have built it wrong.",
          },
          {
            title: "Built for Nepali networks",
            text: "Pages are made to load on a mid-range phone over a mobile connection. Heavy pages that only look good in an office are not finished pages.",
          },
          {
            title: "Your data stays yours",
            text: "Accounts, domains, and hosting are registered in your organization's name, and your content is exportable at any point. Nothing about the arrangement depends on you staying with us.",
          },
          {
            title: "Plain estimates",
            text: "We say what a piece of work costs, what it does not include, and where we are uncertain, before it starts rather than after.",
          },
        ],
      },
      {
        blockType: "processSteps",
        kicker: "How a build runs",
        tone: "tinted",
        heading: "Scope, build, hand over, maintain.",
        steps: [
          { title: "Scope", text: "Agree what the system has to do, who will use it, and what it must connect to." },
          {
            title: "Build",
            text: "Develop it in stages you can see and comment on, rather than a single reveal at the end.",
          },
          {
            title: "Hand over",
            text: "Migrate the content, train your team on the dashboard, and transfer the accounts to your name.",
          },
          {
            title: "Maintain",
            text: "Keep it backed up, updated, and monitored, with someone to call when it matters.",
          },
        ],
      },
      mediaShowcase("it", "Our IT work"),
      contactCta(
        "Need a site or a system built?",
        "Tell us what it has to do, who will be updating it, and when you need it live.",
        "IT",
      ),
    ],
  },

  "/advertisement": {
    seo: {
      title: "Advertising & Commercial Production in Kathmandu, Nepal",
      description:
        "Najikko Sathi Media writes, produces, and places advertising in Nepal: television and video commercials, digital and social campaigns, and print, outdoor, and brand material.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Advertisement",
        heading: "One clear message, made well enough to be remembered.",
        description:
          "We write, produce, and place advertising for businesses and organizations in Nepal - commercials, digital campaigns, and the design work that holds a brand together.",
        ctaLabel: "Start a campaign",
        ctaHref: "/contact?service=Advertisement",
        category: "production",
      },
      {
        blockType: "prose",
        kicker: "Who we are on this",
        heading: "A media house that also makes advertisements.",
        lead: "Advertising sits inside a media house that spends the rest of its time on journalism, documentary, and research. That shapes how we work: we start from what a product or service genuinely does, and we build the campaign on that rather than around it.",
        paragraphs: paragraphs(
          "The practical advantage is that the same team writes, films, edits, designs, and publishes. A commercial, the social creative that supports it, and the page it runs from are made by people who are already talking to each other, so the campaign holds together and the schedule survives contact with reality.",
          "We work with businesses, institutions, and public-interest campaigns, on budgets from a single social film to a full multi-channel launch. The proposal always says plainly what is included, what it costs, and what it cannot promise.",
        ),
      },
      {
        blockType: "featureCards",
        style: "disciplines",
        tone: "tinted",
        kicker: "What we make",
        heading: "Commercials, campaigns, and everything printed.",
        description:
          "Most clients take a combination. The message is written once and then produced in the formats each channel needs.",
        cards: [
          {
            icon: "monitorPlay",
            title: "Television & video commercials",
            text: "Scripted commercials produced for broadcast and for online placement, from a single-idea thirty-second spot to a longer brand film. We write it, cast it, shoot it, and deliver it in the durations each channel accepts.",
            points: points(
              "Concept, script, and storyboard signed off before the shoot",
              "Studio or location production with cast, crew, and equipment",
              "Delivery at broadcast specification, plus digital cut-downs",
            ),
          },
          {
            icon: "radio",
            title: "Digital & social campaigns",
            text: "Advertising made for the feed rather than adapted to it: vertical video, carousels, and static creative that carry one message in the first two seconds, published and boosted from your own pages.",
            points: points(
              "Creative built per platform and per placement",
              "Boosting, targeting, and budget management on Facebook and Instagram",
              "Weekly reporting on reach, cost, and what to change",
            ),
          },
          {
            icon: "sparkles",
            title: "Print, outdoor & brand material",
            text: "The advertising that is not a film: press announcements, hoardings, banners, brochures, and the design system that keeps them all recognizably yours.",
            points: points(
              "Layout, typography, and artwork prepared for press",
              "Hoarding, banner, and backdrop design at final size",
              "A reusable template set your own team can keep using",
            ),
          },
        ],
      },
      {
        blockType: "featureCards",
        style: "topics",
        kicker: "How we think about it",
        heading: "What an advertisement has to get right.",
        cards: [
          {
            title: "The single idea",
            text: "Every advertisement we make is built on one thing the audience should remember. Deciding what that is, and being willing to leave out the rest, is most of the work.",
          },
          {
            title: "The audience",
            text: "Who is being spoken to, where they will see it, and what they already believe. A commercial written for a national broadcast and one written for a district-level campaign are not the same commercial.",
          },
          {
            title: "The production",
            text: "Casting, location, light, sound, and the schedule that keeps a shoot inside its budget. Our production team does this work every week for documentaries, and the same standards apply here.",
          },
          {
            title: "The placement",
            text: "An advertisement is only as good as where it runs. We advise on channel, timing, duration, and spend, and we deliver files that meet each channel's technical specification.",
          },
          {
            title: "The measurement",
            text: "Reach, frequency, cost per result, and what the enquiries afterwards actually looked like. We report it plainly, including when a campaign underperformed.",
          },
          {
            title: "The honesty",
            text: "We do not write claims a client cannot support. Advertising that overstates gets a business one campaign; advertising that is accurate gets it the next one.",
          },
        ],
      },
      {
        blockType: "serviceCards",
        kicker: "Related services",
        heading: "The production scopes behind a campaign.",
        source: "slugs",
        slugs: [
          { slug: "advertisements-commercials" },
          { slug: "social-media-advertisements" },
          { slug: "facebook-boosting-digital-campaigns" },
        ],
      },
      {
        blockType: "processSteps",
        kicker: "How a campaign runs",
        tone: "tinted",
        heading: "Brief, idea, production, placement.",
        steps: [
          { title: "Brief", text: "Agree what is being advertised, to whom, on what budget, and by when." },
          {
            title: "Idea",
            text: "Write the single message and the treatment, and confirm the claims we can support.",
          },
          { title: "Produce", text: "Shoot, design, and edit the creative in every format the plan calls for." },
          {
            title: "Place & report",
            text: "Publish, boost, and monitor the campaign, then report what it returned.",
          },
        ],
      },
      mediaShowcase("advertisement", "Advertising work"),
      contactCta(
        "What are you advertising, and to whom?",
        "Tell us the product or message, the channels you have in mind, and the budget range you are working with.",
        "Advertisement",
      ),
    ],
  },

  "/right-sanchar": {
    seo: {
      title: "Right Sanchar | Our Digital News Portal",
      description:
        "Discover Right Sanchar, Najikko Sathi Media's digital news portal focused on truthful reporting, public-interest stories, commentary, and investigations in Nepal.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Our digital news portal",
        heading: "Right information. Right time. Right perspective.",
        description:
          "Right Sanchar is our platform for accurate, truthful, and unbiased information on issues that matter to the public.",
        ctaLabel: "Read Right Sanchar",
        ctaExternal: true,
      },
      { blockType: "sancharBand" },
      {
        blockType: "featureCards",
        style: "values",
        tone: "tinted",
        kicker: "Our editorial purpose",
        heading: "Help people understand what matters.",
        description:
          "News is useful when it offers facts, context, and a way to understand public issues. Right Sanchar brings reporting, commentary, and investigative content into one digital platform.",
        cards: [
          {
            title: "News reporting",
            text: "Coverage of politics, society, the economy, culture, and issues of public interest, with a focus on truthful information and context.",
          },
          {
            title: "Commentary",
            text: "Perspectives that help audiences consider the meaning of events, alongside a clear distinction between reporting and interpretation.",
          },
          {
            title: "Investigative content",
            text: "Stories that begin with questions and look for supporting sources, background information, and a deeper understanding of an issue.",
          },
        ],
      },
      {
        blockType: "portalLinks",
        kicker: "Visit the newsroom",
        heading: "Find published stories on Right Sanchar.",
        body: "Open the news portal for its current articles. For a story suggestion or a question about our media work, contact Najikko Sathi directly.",
        primaryLabel: "Open news portal",
        secondaryLabel: "Share a story suggestion",
        secondaryHref: "/contact?service=Right%20Sanchar",
      },
      mediaShowcase("right-sanchar", "Right Sanchar"),
      contactCta(
        "A story our audience should know?",
        "Share the background and relevant sources with our team.",
        "Right Sanchar",
      ),
    ],
  },

  "/posts": {
    seo: {
      title: "News, Blogs & Commentary",
      description:
        "Read news, blogs, commentary, and investigative writing published by Najikko Sathi Media in Kathmandu, Nepal.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Writing",
        heading: "News, blogs and commentary.",
        description: "Reporting, analysis, and writing published by our newsroom.",
        ctaLabel: "Share a story",
        ctaHref: "/contact",
      },
      {
        blockType: "postList",
        kicker: "Latest",
        heading: "Recently published",
        limit: 60,
        emptyText: "Nothing has been published yet. New writing will appear here.",
      },
      contactCta("Have something we should cover?"),
    ],
  },

  "/offers": {
    seo: {
      title: "Current Offers & Packages",
      description:
        "See the current offers and packages from Najikko Sathi Media in Kathmandu, Nepal, covering video production, social media handling, training, and research work.",
    },
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Offers",
        heading: "Current offers and packages.",
        description: "Time-limited packages and promotions from our team.",
        ctaLabel: "Ask about an offer",
        ctaHref: "/contact",
      },
      {
        blockType: "offerList",
        kicker: "Available now",
        heading: "What is running",
        limit: 40,
        emptyText: "There are no offers running at the moment. Please check back later.",
      },
      contactCta("Want something tailored instead?"),
    ],
  },

  "/search": {
    seo: { title: "Search", description: "Search the Najikko Sathi website." },
    noindex: true,
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Search",
        heading: "Find what you need.",
        description: "Search services, writing, offers, and pages across this website.",
      },
      { blockType: "searchSection", kicker: "Results", heading: "Search this website" },
    ],
  },

  "/signup": {
    seo: {
      title: "Create a dashboard account",
      description: "Register for access to the Najikko Sathi dashboard.",
    },
    noindex: true,
    sections: [
      {
        blockType: "pageHero",
        eyebrow: "Dashboard access",
        heading: "Create an account.",
        description:
          "Register to manage content on this website. New accounts need an administrator's approval before they can sign in.",
      },
      { blockType: "signupSection" },
    ],
  },
};

/** Is this address one of the website's built-in pages? */
export const isRoutePath = (path: string): boolean => path in routePageContent;
