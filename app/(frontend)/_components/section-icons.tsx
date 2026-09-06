import {
  BookOpen,
  Building2,
  CalendarCheck,
  Camera,
  Clapperboard,
  Compass,
  Film,
  Globe2,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Landmark,
  Megaphone,
  Mic2,
  MonitorPlay,
  MonitorSmartphone,
  Newspaper,
  Radio,
  Search,
  Server,
  Smartphone,
  Sparkles,
  Speech,
  UserRoundPen,
  Users,
} from "lucide-react";

import type { SectionIconName } from "@/lib/section-icons";

/**
 * The icon a card was given in the dashboard, as a drawing.
 *
 * lib/section-icons.ts names them; the dropdown in the dashboard offers those
 * names and this turns the chosen one back into a picture. A name we do not
 * recognise draws nothing rather than breaking the page.
 */
const icons: Record<SectionIconName, typeof Camera> = {
  camera: Camera,
  clapperboard: Clapperboard,
  film: Film,
  megaphone: Megaphone,
  newspaper: Newspaper,
  graduationCap: GraduationCap,
  search: Search,
  monitorSmartphone: MonitorSmartphone,
  speech: Speech,
  heartHandshake: HeartHandshake,
  bookOpen: BookOpen,
  users: Users,
  userRoundPen: UserRoundPen,
  compass: Compass,
  calendarCheck: CalendarCheck,
  monitorPlay: MonitorPlay,
  radio: Radio,
  sparkles: Sparkles,
  layoutDashboard: LayoutDashboard,
  smartphone: Smartphone,
  server: Server,
  landmark: Landmark,
  building2: Building2,
  globe2: Globe2,
  mic2: Mic2,
};

export function SectionIcon({ name }: { name?: string | null }) {
  const Icon = name ? icons[name as SectionIconName] : undefined;
  return Icon ? <Icon aria-hidden="true" /> : null;
}

export const hasSectionIcon = (name?: string | null): boolean =>
  Boolean(name && name in icons);
