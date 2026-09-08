"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { useLanguage } from "./language-provider";

/** One message, in both languages. The Nepali half may be empty. */
export type LeadershipMessage = {
  role: string;
  name: string;
  heading: string;
  message: string;
  roleNe: string;
  nameNe: string;
  headingNe: string;
  messageNe: string;
  photoUrl: string | null;
  photoAlt: string;
};

/** How long a message stays on screen once the carousel is running. */
const INTERVAL = 5000;

/**
 * How long everything must be still before the carousel starts again.
 *
 * Someone who has just pointed at a message, or stepped to one with an arrow,
 * is reading it. Ten seconds of nothing happening is the signal that they are
 * not, and only then does it start moving on by itself again.
 */
const RESUME_AFTER_IDLE = 10000;

/**
 * The chairman's and director's messages, one at a time.
 *
 * The section's heading travels with the message rather than standing still
 * above it: each message carries its own, so moving the carousel on changes the
 * heading and the words together. A message with no heading of its own falls
 * back to the one written for the section.
 *
 * It stops the moment a visitor points at it or tabs into it, and stays stopped
 * while they are there. Stepping through with the arrows stops it too. It only
 * starts again after ten seconds in which nobody has hovered over it or touched
 * it - long enough to finish reading a paragraph without the page moving under
 * you.
 *
 * Nothing here is machine-translated. The website is written in English and
 * turned into Nepali against a phrase book, but a message in someone's own
 * words is not something to guess at, so the band is marked `data-no-translate`
 * and shows only what was written for it in the dashboard.
 */
export function LeadershipCarousel({
  messages,
  kicker,
  heading,
  kickerNe,
  headingNe,
}: {
  messages: LeadershipMessage[];
  kicker: string;
  /** Shown for any message that carries no heading of its own. */
  heading: string;
  kickerNe: string;
  headingNe: string;
}) {
  const { language } = useLanguage();
  const nepali = language === "ne";
  const [current, setCurrent] = useState(0);
  /** The pointer or the keyboard is on the band, so nothing should move. */
  const [held, setHeld] = useState(false);
  /** When the visitor last did something. The idle window is measured from here. */
  const [lastTouched, setLastTouched] = useState(0);

  useEffect(() => {
    if (messages.length < 2 || held) return;

    // Wait out whatever is left of the idle window, then move on every INTERVAL.
    // On first load nothing has been touched, so the wait is zero.
    const wait = Math.max(0, lastTouched + RESUME_AFTER_IDLE - Date.now());
    let interval = 0;
    const resume = window.setTimeout(() => {
      interval = window.setInterval(
        () => setCurrent((index) => (index + 1) % messages.length),
        INTERVAL,
      );
    }, wait);

    return () => {
      window.clearTimeout(resume);
      if (interval) window.clearInterval(interval);
    };
  }, [messages.length, held, lastTouched]);

  /** Anything the visitor does restarts the idle window. */
  const touched = () => setLastTouched(Date.now());

  const go = (step: number) => {
    setCurrent((index) => (index + step + messages.length) % messages.length);
    touched();
  };

  const message = messages[current];
  if (!message) return null;

  // Nepali when it has been written, and the English when it has not - never a
  // translation of one into the other.
  const pick = (english: string, written: string) => (nepali && written ? written : english);
  const shownHeading = pick(message.heading, message.headingNe) || pick(heading, headingNe);
  const shownKicker = pick(kicker, kickerNe);
  const shownName = pick(message.name, message.nameNe);
  const shownRole = pick(message.role, message.roleNe);
  const shownMessage = pick(message.message, message.messageNe);

  return (
    <div
      className="leadership-carousel"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => {
        setHeld(false);
        // The window starts when the pointer leaves, not when it arrived.
        touched();
      }}
      // React's focus events bubble, so tabbing to an arrow holds the carousel
      // for a keyboard visitor exactly as hovering does for a pointer.
      onFocus={() => setHeld(true)}
      onBlur={() => {
        setHeld(false);
        touched();
      }}
    >
      {/* Keyed on the slide so the heading and the message replay the same
          entrance together every time the carousel moves. */}
      <div className="section-heading leadership-heading" key={current} data-no-translate>
        {shownKicker ? (
          <span className="eyebrow">
            <i />
            {shownKicker}
          </span>
        ) : null}
        <h2 aria-live="polite">{shownHeading}</h2>
      </div>
      <article
        className={`leadership-message${message.photoUrl ? "" : " leadership-message--copy-only"}`}
        key={`message-${current}`}
        aria-live="polite"
        data-no-translate
        lang={nepali && message.messageNe ? "ne" : "en"}
      >
        {/* No portrait uploaded for this message: the message has the card to
            itself rather than sitting beside a blue blob standing in for one. */}
        {message.photoUrl ? (
          <div className="leadership-portrait">
            <Image src={message.photoUrl} alt={message.photoAlt} width={360} height={360} />
          </div>
        ) : null}
        <div className="leadership-copy">
          <Quote className="leadership-quote-mark" aria-hidden="true" />
          {shownMessage
            .split("\n")
            .filter((line) => line.trim())
            .map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          <div className="leadership-attribution">
            <strong>{shownName}</strong>
            <span>{shownRole}</span>
          </div>
        </div>
      </article>
      {messages.length > 1 ? (
        <div className="leadership-controls">
          <button type="button" onClick={() => go(-1)} aria-label="Previous message">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span className="leadership-dots">
            {messages.map((item, index) => (
              <i key={`${item.role}-${item.name}`} className={index === current ? "is-current" : undefined} />
            ))}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next message">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
