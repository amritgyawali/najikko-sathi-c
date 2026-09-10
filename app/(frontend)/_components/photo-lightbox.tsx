"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type AlbumPhoto = { src: string; alt: string; caption: string };

/**
 * The album on a social work entry's page.
 *
 * The grid is the same one the site uses everywhere else, so a page of
 * photographs reads at a glance. Opening one puts it on screen at the size it
 * was uploaded at, with the arrows and the keyboard stepping through the rest -
 * a visitor who came to look at the photographs should not have to open each
 * one in a new tab to see it properly.
 *
 * With JavaScript unavailable the grid is still the grid: every photograph is
 * on the page, at its full width, with its caption. Only the overlay is lost.
 */
export function PhotoAlbum({ photos }: { photos: AlbumPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (by: number) =>
      setOpen((current) => (current === null ? current : (current + by + photos.length) % photos.length)),
    [photos.length],
  );

  // The keyboard drives the overlay while it is up, and the page behind it
  // stays where the visitor left it rather than scrolling under the picture.
  useEffect(() => {
    if (open === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (photos.length === 0) return null;
  const shown = open === null ? null : photos[open];

  return (
    <>
      <div className="social-album">
        {photos.map((photo, index) => (
          <figure key={`${photo.src}-${index}`}>
            <button
              type="button"
              className="social-album-open"
              onClick={() => setOpen(index)}
              aria-label={`Open photograph ${index + 1} of ${photos.length}`}
            >
              <Image src={photo.src} alt={photo.alt} width={640} height={430} />
            </button>
            {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
          </figure>
        ))}
      </div>

      {shown ? (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={shown.caption || shown.alt}
          onClick={close}
        >
          {/* The picture and its controls keep their own clicks, so only the
              darkened area around them closes the overlay. */}
          <div className="photo-lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <Image
              src={shown.src}
              alt={shown.alt}
              width={1600}
              height={1067}
              sizes="(max-width: 900px) 100vw, 90vw"
            />
            {shown.caption ? <p>{shown.caption}</p> : null}
          </div>
          <button type="button" className="photo-lightbox-close" onClick={close} aria-label="Close">
            <X aria-hidden="true" />
          </button>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="photo-lightbox-step photo-lightbox-step--back"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photograph"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="photo-lightbox-step photo-lightbox-step--on"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                aria-label="Next photograph"
              >
                <ChevronRight aria-hidden="true" />
              </button>
              <span className="photo-lightbox-count" data-no-translate>
                {open! + 1} / {photos.length}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
