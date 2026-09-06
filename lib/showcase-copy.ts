/**
 * What each "in pictures & film" band says about its own page.
 *
 * The band used to introduce itself the same way everywhere: the label "In
 * focus" and the sentence "A space for images and films from our work.", on a
 * dozen pages plus every service page. Repeated that many times it stops being
 * a description and becomes furniture - it tells a reader nothing about the
 * page they are on, and search engines see the same paragraph a dozen times.
 *
 * So the copy lives here, keyed by the same Page media key that fills the
 * placeholder, and each entry says what is actually in that page's pictures.
 * An editor can override either line per page in Content → Website pages; this
 * is the wording used until they do, and it is what an already-imported page
 * shows without anyone having to re-edit it.
 *
 * A key with no entry gets a kicker and no description, rather than a generic
 * sentence - saying nothing is better than saying the same thing again.
 */

export type ShowcaseCopy = {
  /** The small label above the heading. */
  kicker: string;
  /** One line under the heading, describing this page's pictures. */
  description?: string;
};

export const showcaseCopy: Record<string, ShowcaseCopy> = {
  home: {
    kicker: "Our work in frame",
    description:
      "A short look at the productions, campaigns and training we have delivered from Kathmandu.",
  },
  about: {
    kicker: "Inside the studio",
    description: "Our team at work, the space we work from, and the kit we shoot on.",
  },
  "our-work": {
    kicker: "Selected work",
    description: "Stills and films from recent client projects, picked to show the range.",
  },
  production: {
    kicker: "On location",
    description: "Filming, direction and post-production, from the shoot floor to the edit suite.",
  },
  "social-media-handling": {
    kicker: "Made for feeds",
    description: "Short-form video and campaign artwork cut for the platforms they run on.",
  },
  training: {
    kicker: "In the classroom",
    description: "Workshops and mentoring sessions, and the work participants make in them.",
  },
  research: {
    kicker: "Fieldwork",
    description: "Interviews, data gathering and the documentation behind our reports.",
  },
  it: {
    kicker: "Built and shipped",
    description: "Screens and walkthroughs from the systems and websites we have built.",
  },
  advertisement: {
    kicker: "On air",
    description: "Commercials and print artwork, shown beside the campaigns they belong to.",
  },
  "right-sanchar": {
    kicker: "From the newsroom",
    description: "Reporting, studio recordings and coverage published on Right Sanchar.",
  },
};

/** The label used when a placeholder has no entry of its own. */
export const DEFAULT_SHOWCASE_KICKER = "In focus";

/**
 * The copy for one placeholder.
 *
 * `service` is the short title of a service page, which has no entry here
 * because services are written in the dashboard - its band describes itself
 * from the service's own name instead.
 */
export function showcaseCopyFor(mediaKey: string, service?: string): ShowcaseCopy {
  const known = showcaseCopy[mediaKey];
  if (known) return known;
  if (service) {
    return {
      kicker: "This service in frame",
      description: `Photographs and films from ${service.toLowerCase()} projects we have delivered.`,
    };
  }
  return { kicker: DEFAULT_SHOWCASE_KICKER };
}
