"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * The media system wheel: six petals around the company logo, one for each
 * discipline, each of them a link to that discipline's page.
 *
 * Every petal is the same rounded wedge, drawn straight into the wheel's own
 * 100x100 coordinate space at its own angle, so the ring is exact in any
 * browser. Each petal sits in its own full-size overlay: only the drawn shape
 * and its label take the pointer, which gives every link a hit area matching
 * the petal a visitor can actually see.
 *
 * Pointing at a petal sets it off: the wedge is thrown out of the ring, its six
 * neighbours give way, a shock ring runs out from the middle, and sparks fly
 * off the outer edge in the petal's own colour. Everything is drawn relative to
 * the wheel's own coordinate space, so the whole display scales with the wheel
 * and reads the same on a phone as on a desktop. A visitor who has asked for
 * less motion gets the wheel with none of it.
 */

export type WheelPetal = { label: string; href: string; from: string; to: string };

/** Inner and outer radius of the ring, as a share of the wheel's width. */
const INNER = 20.5;
const OUTER = 46;
/** Half the angle one petal covers. The remainder of the 60° is the gap. */
const HALF_ANGLE = 26;
/** Corner rounding, in the same units as the radii. */
const CORNER = 4;
/** Where a petal's label sits, measured from the middle of the wheel. */
const LABEL = (INNER + OUTER) / 2;

/** How far out of the ring the pointed-at petal is thrown. */
const BLAST = 3.4;
/** How far the other five give way while it is out. */
const RECOIL = 1.5;
/** How much bigger the thrown petal is, and how much smaller the others. */
const GROW = 1.075;
const SHRINK = 0.955;
/** Pieces thrown off the outer edge of a petal as it goes. */
const SPARKS = 16;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const round = (value: number) => Math.round(value * 100) / 100;

const point = (radius: number, degrees: number) =>
  [50 + radius * Math.cos(rad(degrees)), 50 + radius * Math.sin(rad(degrees))] as const;

const at = (radius: number, degrees: number) => point(radius, degrees).map(round).join(" ");

/**
 * One petal: an arc along the outer edge, an arc back along the inner edge,
 * and a rounded corner where each pair of edges meets.
 */
function petalPath(axis: number): string {
  // How far round each arc has to stop short to leave room for the corner.
  const outerInset = (CORNER / OUTER) * (180 / Math.PI);
  const innerInset = (CORNER / INNER) * (180 / Math.PI);
  const [from, to] = [axis - HALF_ANGLE, axis + HALF_ANGLE];

  return [
    `M ${at(OUTER, from + outerInset)}`,
    `A ${OUTER} ${OUTER} 0 0 1 ${at(OUTER, to - outerInset)}`,
    `Q ${at(OUTER, to)} ${at(OUTER - CORNER, to)}`,
    `L ${at(INNER + CORNER, to)}`,
    `Q ${at(INNER, to)} ${at(INNER, to - innerInset)}`,
    `A ${INNER} ${INNER} 0 0 0 ${at(INNER, from + innerInset)}`,
    `Q ${at(INNER, from)} ${at(INNER + CORNER, from)}`,
    `L ${at(OUTER - CORNER, from)}`,
    `Q ${at(OUTER, from)} ${at(OUTER, from + outerInset)}`,
    "Z",
  ].join(" ");
}

/**
 * A repeatable number between 0 and 1. The sparks have to differ from one
 * another without differing between renders, so their spread, size and reach
 * are derived from a seed rather than drawn at random.
 */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/** How long a burst stays on screen before it is taken off the wheel. */
const BURST_MS = 1200;

/** The shock ring and the sparks thrown by one petal, played once. */
function Burst({ axis, color }: { axis: number; color: string }) {
  const [ringX, ringY] = point(OUTER - 7, axis);

  return (
    <g>
      {/* The shock running out from behind the logo. */}
      <motion.circle
        cx="50"
        cy="50"
        r={INNER + 3}
        fill="none"
        stroke={color}
        strokeWidth={0.9}
        initial={{ scale: 0.75, opacity: 0.6 }}
        animate={{ scale: 2.15, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      />
      {/* The ring blown off the petal's own outer edge. */}
      <motion.circle
        cx={round(ringX)}
        cy={round(ringY)}
        r={8}
        fill="none"
        stroke={color}
        strokeWidth={1.3}
        initial={{ scale: 0.25, opacity: 0.85 }}
        animate={{ scale: 2.5, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      {Array.from({ length: SPARKS }, (_, index) => {
        // Fanned across the petal's own width and thrown straight outwards.
        const angle = axis + (noise(index * 3 + 1) - 0.5) * 2.6 * HALF_ANGLE;
        const reach = 8 + noise(index * 7 + 3) * 17;
        const size = 0.55 + noise(index * 11 + 5) * 0.95;
        const flight = 0.55 + noise(index * 13 + 7) * 0.45;
        const [fromX, fromY] = point(OUTER - 3, angle);
        const move = {
          x: round(Math.cos(rad(angle)) * reach),
          y: round(Math.sin(rad(angle)) * reach),
        };
        const common = {
          fill: color,
          initial: { x: 0, y: 0, scale: 0.2, opacity: 0 },
          animate: { ...move, scale: [0.2, 1, 0], opacity: [0, 1, 0] },
          exit: { opacity: 0 },
          transition: { duration: flight, ease: [0.16, 1, 0.3, 1] as const },
        };

        // Alternating streaks and embers, so the spray does not read as a
        // single repeated dot.
        return index % 2 === 0 ? (
          <motion.rect
            key={index}
            x={round(fromX - size * 1.9)}
            y={round(fromY - size * 0.35)}
            width={round(size * 3.8)}
            height={round(size * 0.7)}
            rx={round(size * 0.35)}
            style={{ rotate: round(angle) }}
            {...common}
          />
        ) : (
          <motion.circle key={index} cx={round(fromX)} cy={round(fromY)} r={round(size)} {...common} />
        );
      })}
    </g>
  );
}

export function MediaWheel({
  petals,
  logoUrl,
  logoAlt,
  initials,
}: {
  petals: WheelPetal[];
  logoUrl: string | null;
  logoAlt: string;
  initials: string;
}) {
  const gradient = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const still = useReducedMotion();

  const [hovered, setHovered] = useState<number | null>(null);
  // The colour the middle glows in, kept after the pointer leaves so the glow
  // fades out in the colour it came up in rather than snapping to another.
  const [tint, setTint] = useState(petals[0]?.from ?? "#1268d3");
  const [burst, setBurst] = useState<{ index: number; id: number } | null>(null);
  // The petals fly in on load; after that they answer the pointer at once.
  const [entered, setEntered] = useState(false);

  const bursts = useRef(0);
  const timer = useRef(0);

  useEffect(() => {
    const settled = window.setTimeout(() => setEntered(true), 400 + petals.length * 90);
    return () => window.clearTimeout(settled);
  }, [petals.length]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = useCallback(
    (index: number) => {
      setHovered(index);
      setTint(petals[index].from);
      if (still) return;

      // The burst plays to the end even if the pointer has already moved on.
      const id = (bursts.current += 1);
      setBurst({ index, id });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => setBurst((current) => (current?.id === id ? null : current)),
        BURST_MS,
      );
    },
    [petals, still],
  );

  // Guarded by index, so moving straight from one petal to the next cannot
  // leave the wheel thinking nothing is pointed at.
  const leave = useCallback(
    (index: number) => setHovered((current) => (current === index ? null : current)),
    [],
  );
  const leaveAll = useCallback(() => setHovered(null), []);

  const settle: Transition = still
    ? { duration: 0 }
    : { type: "spring", stiffness: 340, damping: 17, mass: 0.7 };

  return (
    <div className="media-system" role="group" aria-label="Our media system">
      <div className="media-system-wheel" onMouseLeave={leaveAll}>
        {/* A slow ring of ticks around the wheel, so the panel it used to sit
            on is not missed once the wheel stands on the page by itself. */}
        <motion.svg
          className="media-system-ring"
          viewBox="0 0 100 100"
          aria-hidden="true"
          animate={still ? undefined : { rotate: 360 }}
          transition={{ duration: 64, ease: "linear", repeat: Infinity }}
        >
          <circle
            cx="50"
            cy="50"
            r="48.6"
            fill="none"
            stroke="rgb(6 43 92 / 14%)"
            strokeWidth="0.45"
            strokeDasharray="0.6 4.6"
            strokeLinecap="round"
          />
        </motion.svg>

        {petals.map((petal, index) => {
          // Clockwise from the top, which in SVG coordinates starts at -90°.
          const axis = -90 + (index * 360) / petals.length;
          const active = hovered === index;
          const away = hovered !== null && !active;
          const shift = active ? BLAST : away ? -RECOIL : 0;
          const scale = active ? GROW : away ? SHRINK : 1;
          // The label rides the petal: the wedge grows about the middle of the
          // wheel, so the label's distance from it grows by the same amount.
          const [labelX, labelY] = point(LABEL * scale + shift, axis);
          // Where it sits at rest. Written as plain styles as well, so the
          // label is in the right place in the page the server sends, before
          // any of this has been asked to run.
          const [restX, restY] = point(LABEL, axis);
          const shape = petalPath(axis);

          const flight: Transition = entered || still ? settle : {
            type: "spring",
            stiffness: 170,
            damping: 18,
            mass: 0.9,
            delay: 0.09 * index,
          };

          return (
            <Link
              className={`media-petal${active ? " is-active" : ""}${away ? " is-away" : ""}`}
              href={petal.href}
              key={petal.label}
              onMouseEnter={() => enter(index)}
              onMouseLeave={() => leave(index)}
              onFocus={() => enter(index)}
              onBlur={() => leave(index)}
            >
              <motion.svg
                viewBox="0 0 100 100"
                aria-hidden="true"
                initial={still ? false : { scale: 0.3, rotate: -32, opacity: 0, x: "0%", y: "0%" }}
                animate={{
                  scale,
                  rotate: 0,
                  opacity: away ? 0.62 : 1,
                  x: `${round(Math.cos(rad(axis)) * shift)}%`,
                  y: `${round(Math.sin(rad(axis)) * shift)}%`,
                }}
                transition={flight}
              >
                <defs>
                  <linearGradient id={`${gradient}-${index}`} x1="0" y1="0" x2="0.55" y2="1">
                    <stop offset="0%" stopColor={petal.from} />
                    <stop offset="100%" stopColor={petal.to} />
                  </linearGradient>
                </defs>
                <path d={shape} fill={`url(#${gradient}-${index})`} />
                {/* The flash across the wedge as it is thrown. */}
                <motion.path
                  d={shape}
                  fill="#fff"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: active ? 0.2 : 0 }}
                  transition={{ duration: active ? 0.18 : 0.4 }}
                />
              </motion.svg>
              <motion.span
                style={{ left: `${round(restX)}%`, top: `${round(restY)}%` }}
                initial={still ? false : { opacity: 0, scale: 0.6, x: "-50%", y: "-50%" }}
                animate={{
                  left: `${round(labelX)}%`,
                  top: `${round(labelY)}%`,
                  opacity: away ? 0.66 : 1,
                  scale: active ? 1.1 : away ? 0.95 : 1,
                  x: "-50%",
                  y: "-50%",
                }}
                transition={flight}
              >
                {petal.label}
              </motion.span>
            </Link>
          );
        })}

        {/* Everything thrown off a petal is drawn here, over the ring and
            clear of the links, so nothing a burst draws can take a click. */}
        <svg className="media-system-fx" viewBox="0 0 100 100" aria-hidden="true">
          <AnimatePresence>
            {burst ? (
              <Burst
                key={burst.id}
                axis={-90 + (burst.index * 360) / petals.length}
                color={petals[burst.index].from}
              />
            ) : null}
          </AnimatePresence>
        </svg>

        {/* Both of these are centred by half their own width, which framer
            motion has to be told about: it writes the whole transform, so a
            translate left in the stylesheet would simply be overwritten. */}
        <motion.span
          className="media-system-glow"
          aria-hidden="true"
          style={{ background: `radial-gradient(circle, ${tint} 0%, transparent 68%)` }}
          animate={{
            opacity: hovered === null ? 0.14 : 0.42,
            scale: hovered === null ? 1 : 1.22,
            x: "-50%",
            y: "-50%",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        />
        <motion.span
          className="media-system-core"
          animate={{ scale: hovered === null ? 1 : 1.07, x: "-50%", y: "-50%" }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          {logoUrl ? (
            <Image src={logoUrl} alt={logoAlt} width={220} height={220} />
          ) : (
            <strong>{initials}</strong>
          )}
        </motion.span>
      </div>
    </div>
  );
}
