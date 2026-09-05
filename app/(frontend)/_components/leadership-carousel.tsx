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
 * The chairman's and director's messages, one at a time. The carousel moves on
 * by itself every five seconds, and the arrows step through it by hand. Manual
 * navigation restarts the timer so a message never disappears mid-sentence.
 */
export function LeadershipCarousel({ messages }: { messages: LeadershipMessage[] }) {
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
      <article className="leadership-message" aria-live="polite">
        <div className="leadership-portrait">
          {message.photoUrl ? (
            <Image src={message.photoUrl} alt={message.photoAlt} width={360} height={360} />
          ) : (
            <span aria-hidden="true">{message.name.slice(0, 1)}</span>
          )}
        </div>
        <div className="leadership-copy">
          <Quote className="leadership-quote-mark" aria-hidden="true" />
          {message.heading ? <h3>{message.heading}</h3> : null}
          <p>{message.message}</p>
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
