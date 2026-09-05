import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAnnouncement } from "@/lib/content";

/** Site-wide notice. Renders nothing unless one is switched on and in date. */
export async function AnnouncementBar() {
  const announcement = await getAnnouncement();
  if (!announcement) return null;

  return (
    <div className={`announcement-bar announcement-${announcement.tone ?? "info"}`} role="region" aria-label="Announcement">
      <div className="site-container announcement-inner">
        <p>{announcement.message}</p>
        {announcement.linkHref && announcement.linkLabel ? (
          <Link href={announcement.linkHref}>
            {announcement.linkLabel} <ArrowRight aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
