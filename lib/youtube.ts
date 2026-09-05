/**
 * Pulls the video id out of whatever YouTube link an editor pasted, so the
 * dashboard accepts an ordinary watch URL, a share link, or an embed URL.
 * Returns null when the link is not a YouTube video, and the caller then shows
 * nothing rather than an empty player.
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  const id =
    host === "youtu.be"
      ? parsed.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? parsed.searchParams.get("v") ??
          parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ??
          null
        : null;

  return id && /^[\w-]{6,20}$/.test(id) ? id : null;
}

/** Privacy-enhanced player URL, which sets no cookie until playback starts. */
export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
