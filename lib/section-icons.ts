/**
 * The icons a section can use, named once.
 *
 * The dashboard offers this list in a dropdown (cms/sections.ts) and the
 * website maps the chosen name onto a Lucide component
 * (app/(frontend)/_components/section-icons.tsx). Keeping the names here, free
 * of React and of Payload, is what lets both sides agree without importing
 * each other.
 */
export const sectionIcons = [
  { label: "Camera", value: "camera" },
  { label: "Clapperboard", value: "clapperboard" },
  { label: "Film", value: "film" },
  { label: "Megaphone", value: "megaphone" },
  { label: "Newspaper", value: "newspaper" },
  { label: "Graduation cap", value: "graduationCap" },
  { label: "Magnifying glass", value: "search" },
  { label: "Phone & screen", value: "monitorSmartphone" },
  { label: "Speech", value: "speech" },
  { label: "Handshake", value: "heartHandshake" },
  { label: "Open book", value: "bookOpen" },
  { label: "People", value: "users" },
  { label: "Person & pen", value: "userRoundPen" },
  { label: "Compass", value: "compass" },
  { label: "Calendar", value: "calendarCheck" },
  { label: "Screen & play", value: "monitorPlay" },
  { label: "Radio", value: "radio" },
  { label: "Sparkles", value: "sparkles" },
  { label: "Dashboard", value: "layoutDashboard" },
  { label: "Smartphone", value: "smartphone" },
  { label: "Server", value: "server" },
  { label: "Government building", value: "landmark" },
  { label: "Office building", value: "building2" },
  { label: "Globe", value: "globe2" },
  { label: "Microphone", value: "mic2" },
] as const;

export type SectionIconName = (typeof sectionIcons)[number]["value"];
