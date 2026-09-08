"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export type LeadershipMessage = {
  role: string;
  name: string;
  heading: string;
  message: string;
  photoUrl: string | null;
  photoAlt: string;
};

const INTERVAL = 5000;

/**
 * The chairman's and director's messages, one at a time.
 *
 * The section's heading travels with the message rather than standing still
 * above it: each message carries its own, so moving the carousel on changes the
 * heading and the words together. A message with no heading of its own falls
 * back to the one written for the section, which is how the band read before
 * the headings were per-message.
 *
 * The carousel moves on by itself every five seconds, and the arrows step
 * through it by hand. Manual navigation restarts the timer so a message never
 * disappears mid-sentence.
 */
export function LeadershipCarousel({
  messages,
  kicker,
  heading,
}: {
  messages: LeadershipMessage[];
  kicker: string;
  /** Shown for any message that carries no heading of its own. */
  heading: string;
}) {
  const [current, setCurrent] = useState(0);
  // Bumped on every manual move, which restarts the interval below.
  const [restart, setRestart] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setCurrent((index) => (index + 1) % messages.length), INTERVAL);
    return () => clearInterval(timer);
  }, [messages.length, restart]);

  const go = (step: number) => {
    setCurrent((index) => (index + step + messages.length) % messages.length);
    setRestart((value) => value + 1);
  };

  const message = messages[current];
  if (!message) return null;

  return (
    <div className="leadership-carousel">
      {/* Keyed on the slide so the heading and the message replay the same
          entrance together every time the carousel moves. */}
      <div className="section-heading leadership-heading" key={current}>
        {kicker ? (
          <span className="eyebrow">
            <i />
            {kicker}
          </span>
        ) : null}
        <h2 aria-live="polite">{message.heading || heading}</h2>
      </div>
      <article className="leadership-message" key={`message-${current}`} aria-live="polite">
        <div className="leadership-portrait">
          {message.photoUrl ? (
            <Image src={message.photoUrl} alt={message.photoAlt} width={360} height={360} />
          ) : (
            <span aria-hidden="true">{message.name.slice(0, 1)}</span>
          )}
        </div>
        <div className="leadership-copy">
          <Quote className="leadership-quote-mark" aria-hidden="true" />
          {message.message.split("\n").filter((line) => line.trim()).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
          <div className="leadership-attribution">
            <strong>{message.name}</strong>
            <span>{message.role}</span>
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
