import type { MediaSlot } from "@/payload-types";

import { mediaAlt, mediaUrl } from "./media";
import { youtubeEmbedUrl, youtubeId, youtubeWatchUrl } from "./youtube";

/**
 * Turns a Page media row into what a page actually renders.
 *
 * A row can be filled in several ways, and this is the one place that decides
 * which of them wins, so the showcase band, the homepage panel and the
 * production panel all read a saved film or photograph the same way.
 */

export type SlotPhoto = {
  src: string;
  alt: string;
  caption: string;
};

/** A film, either as a file the page plays itself or as a YouTube embed. */
export type SlotFilm = {
  kind: "file" | "youtube";
  /** The file to play, or the privacy-enhanced embed address. */
  src: string;
  /** Where the film can be watched in full, for the YouTube case. */
  watchUrl: string | null;
  /** The still shown before playback. Empty when none was given. */
  poster: string;
  title: string;
  description: string;
  transcript: string;
  uploadDate: string;
  duration: string;
};

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** The photograph an editor uploaded, or null while the row is empty. */
export function slotPhoto(
  slot: MediaSlot | null | undefined,
  fallbackAlt: string,
): SlotPhoto | null {
  const src = mediaUrl(slot?.image);
  if (!src) return null;

  return {
    src,
    alt: mediaAlt(slot?.image, slot?.caption || fallbackAlt),
    caption: text(slot?.caption),
  };
}

/**
 * The film an editor added, or null while the row is empty. An uploaded file
 * wins, then a YouTube link, then the address of a film hosted elsewhere -
 * which is the order the dashboard describes.
 */
export function slotFilm(
  slot: MediaSlot | null | undefined,
  fallbackTitle: string,
): SlotFilm | null {
  const video = slot?.video;
  if (!video) return null;

  const uploaded = mediaUrl(video.file);
  const youtube = youtubeId(video.youtubeUrl);
  const linked = text(video.src);
  if (!uploaded && !youtube && !linked) return null;

  const common = {
    poster: mediaUrl(video.posterImage) ?? text(video.poster),
    title: text(video.title) || fallbackTitle,
    description: text(video.description),
    transcript: text(video.transcript),
    uploadDate: text(video.uploadDate),
    duration: text(video.duration),
  };

  if (uploaded || (!youtube && linked)) {
    return { kind: "file", src: (uploaded ?? linked) as string, watchUrl: null, ...common };
  }

  return {
    kind: "youtube",
    src: youtubeEmbedUrl(youtube as string),
    watchUrl: youtubeWatchUrl(youtube as string),
    ...common,
  };
}

/** True once a row has something a visitor would see. Used by the dashboard. */
export const slotIsFilled = (slot: MediaSlot | null | undefined): boolean =>
  Boolean(slotPhoto(slot, "") || slotFilm(slot, ""));
