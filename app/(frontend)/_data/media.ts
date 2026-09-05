/**
 * Owner-managed media. Store files in public/media, then configure their URL here.
 * There is deliberately no visitor upload endpoint or first-visitor setup flow.
 * Changes require repository write access and a new deployment.
 */
export type PageMedia = {
  image?: { src: string; alt: string; caption: string };
  video?: {
    src: string;
    poster: string;
    title: string;
    description: string;
    captions: string;
    transcript: string;
    uploadDate: string;
    duration: string;
  };
};

export const pageMedia: Record<string, PageMedia> = {
  home: {}, about: {}, services: {}, "our-work": {}, production: {}, training: {}, "right-sanchar": {}, contact: {},
  "social-media-handling": {}, research: {}, advertisement: {}, it: {},
  "biography-videos": {}, "documentary-film-production": {}, "advertisements-commercials": {},
  "corporate-profile-making": {}, "digital-profile-creation": {}, "media-consulting": {},
  "facebook-boosting-digital-campaigns": {}, "social-media-advertisements": {}, "event-coverage-management": {},
  "social-media-strategy-training": {}, "content-creation-training": {}, "journalism-basics-training": {},
  "creative-technical-production-training": {}, "idea-monetization-training": {}, "source-research": {},
  "government-ngo-collaboration": {},
};
